import { supabase } from '../lib_supabase';

const DB_NAME = 'konnekt-secure-keys';
const STORE_NAME = 'identities';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function openKeyDb() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('Secure local key storage is unavailable in this browser.'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open secure key storage.'));
  });
}
async function readKey(userId) {
  const db = await openKeyDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(userId);
    request.onsuccess = () => { const value = request.result || null; db.close(); resolve(value); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}
async function saveKey(userId, value) {
  const db = await openKeyDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(value, userId);
    request.onsuccess = () => { db.close(); resolve(); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}
function toBase64(bytes) {
  let binary = '';
  new Uint8Array(bytes).forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}
function fromBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

export async function ensureKonnektIdentity(userId) {
  if (!globalThis.crypto?.subtle) throw new Error('Secure encryption is unavailable. Open KONNEKT using HTTPS on a supported browser.');
  let identity = await readKey(userId);
  const { data: profile, error: readError } = await supabase.from('profiles').select('encryption_public_key').eq('id', userId).maybeSingle();
  if (readError) throw readError;
  // Never silently replace a server-registered identity when this device has lost its private key.
  if ((!identity?.privateKey || !identity?.publicJwk) && profile?.encryption_public_key) {
    throw new Error('This account already has an encryption identity, but its private key is not stored on this device. Restore your encrypted key backup before opening encrypted chats. KONNEKT will not replace your old key.');
  }
  if (!identity?.privateKey || !identity?.publicJwk) {
    const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
    const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    identity = { privateKey: pair.privateKey, publicJwk };
    await saveKey(userId, identity);
  }
  const publicKey = JSON.stringify(identity.publicJwk);
  if (profile?.encryption_public_key !== publicKey) {
    const { error } = await supabase.from('profiles').update({ encryption_public_key: publicKey }).eq('id', userId);
    if (error) throw new Error(`Could not publish your encryption public key. Apply the database upgrade first. ${error.message}`);
  }
  return identity;
}

async function deriveConversationKey(userId, otherPublicKey) {
  const identity = await ensureKonnektIdentity(userId);
  const jwk = typeof otherPublicKey === 'string' ? JSON.parse(otherPublicKey) : otherPublicKey;
  const importedOther = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  return crypto.subtle.deriveKey({ name: 'ECDH', public: importedOther }, identity.privateKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptKonnektText({ userId, otherUserId, otherPublicKey, text }) {
  const key = await deriveConversationKey(userId, otherPublicKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text));
  return { body: toBase64(encrypted), encryption_iv: toBase64(iv), is_encrypted: true };
}

export async function decryptKonnektText({ userId, otherUserId, otherPublicKey, body, encryption_iv }) {
  const key = await deriveConversationKey(userId, otherPublicKey);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(encryption_iv) }, key, fromBase64(body));
  return decoder.decode(plain);
}


// Group encryption uses one random AES-GCM key per conversation version.
// That key is wrapped separately for every member using ECDH-derived AES-GCM.
export async function getKonnektConversationCryptoKey(userId, otherPublicKey) {
  return deriveConversationKey(userId, otherPublicKey);
}

export async function createGroupKeyEnvelopes(conversationId, memberProfiles, keyVersion = 1) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before setting up group encryption.');
  const identity = await ensureKonnektIdentity(user.id);
  const rawGroupKey = crypto.getRandomValues(new Uint8Array(32));
  const senderPublicKey = JSON.stringify(identity.publicJwk);
  const envelopes = [];
  for (const member of memberProfiles) {
    if (!member?.id || !member?.encryption_public_key) throw new Error('Every group member must open KONNEKT once before secure group messaging can be enabled.');
    const wrappingKey = await deriveConversationKey(user.id, member.encryption_public_key);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrappingKey, rawGroupKey);
    envelopes.push({
      conversation_id: conversationId,
      user_id: member.id,
      sender_id: user.id,
      sender_public_key: senderPublicKey,
      key_version: keyVersion,
      wrapped_key: toBase64(wrapped),
      wrap_iv: toBase64(iv)
    });
  }
  const { error } = await supabase.from('group_key_envelopes').insert(envelopes);
  if (error) throw error;
  return true;
}

export async function getGroupKonnektCryptoKey(conversationId, userId) {
  const { data: envelope, error } = await supabase.from('group_key_envelopes')
    .select('sender_id,sender_public_key,key_version,wrapped_key,wrap_iv')
    .eq('conversation_id', conversationId).eq('user_id', userId)
    .order('key_version', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!envelope) return null;
  const wrappingKey = await deriveConversationKey(userId, envelope.sender_public_key);
  const raw = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(envelope.wrap_iv) },
    wrappingKey,
    fromBase64(envelope.wrapped_key)
  );
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt','decrypt']);
}

export async function encryptWithKonnektCryptoKey(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const bytes = value instanceof Blob ? await value.arrayBuffer() : encoder.encode(String(value));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
  return { body: toBase64(cipher), encryption_iv: toBase64(iv), is_encrypted: true };
}

export async function decryptWithKonnektCryptoKey(key, body, iv) {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, key, fromBase64(body));
  return decoder.decode(plain);
}

export async function encryptKonnektBinary(key, file) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, await file.arrayBuffer());
  return { blob: new Blob([cipher], { type: 'application/octet-stream' }), iv: toBase64(iv) };
}

export async function decryptKonnektBinary(key, encryptedBlob, iv, mimeType = 'application/octet-stream') {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, key, await encryptedBlob.arrayBuffer());
  return new Blob([plain], { type: mimeType });
}


// Passphrase-protected, cross-device recovery. The server stores ciphertext only.
export async function getStoredKonnektIdentity(userId) { return userId ? readKey(userId) : null; }
const RECOVERY_ITERATIONS = 310000;
async function deriveRecoveryKey(passphrase, salt) {
  if (String(passphrase || '').length < 12) throw new Error('Use a recovery passphrase with at least 12 characters.');
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: RECOVERY_ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt','decrypt']);
}
export async function createKonnektKeyBackup(passphrase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before creating a key recovery backup.');
  const identity = await ensureKonnektIdentity(user.id);
  if (!identity.privateKey.extractable) throw new Error('This account key was created by an older version and cannot be exported safely. Keep the original device signed in; create a recovery backup after a new supported identity is provisioned.');
  const pkcs8 = await crypto.subtle.exportKey('pkcs8', identity.privateKey);
  const payload = JSON.stringify({ version: 1, userId: user.id, publicJwk: identity.publicJwk, privateKey: toBase64(pkcs8) });
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveRecoveryKey(passphrase, salt);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(payload));
  const row = { user_id: user.id, ciphertext: toBase64(cipher), salt: toBase64(salt), iv: toBase64(iv), iterations: RECOVERY_ITERATIONS, key_version: 1, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('user_key_backups').upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
  return true;
}
export async function restoreKonnektKeyBackup(passphrase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before restoring your encryption key.');
  const { data: row, error } = await supabase.from('user_key_backups').select('ciphertext,salt,iv,iterations,key_version').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  if (!row) throw new Error('No recovery backup exists for this account.');
  if (row.key_version !== 1 || row.iterations < 100000 || row.iterations > 1000000) throw new Error('This recovery backup version is not supported.');
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: fromBase64(row.salt), iterations: row.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  let payload;
  try { payload = JSON.parse(decoder.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(row.iv) }, key, fromBase64(row.ciphertext)))); }
  catch { throw new Error('Recovery passphrase is incorrect or the backup is damaged.'); }
  if (payload.userId !== user.id || !payload.publicJwk || !payload.privateKey) throw new Error('Recovery backup does not match this signed-in account.');
  const privateKey = await crypto.subtle.importKey('pkcs8', fromBase64(payload.privateKey), { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey']);
  await saveKey(user.id, { privateKey, publicJwk: payload.publicJwk });
  const publicKey = JSON.stringify(payload.publicJwk);
  const { error: profileError } = await supabase.from('profiles').update({ encryption_public_key: publicKey }).eq('id', user.id);
  if (profileError) throw profileError;
  return true;
}
export async function getKonnektIdentityFingerprint(publicJwk) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify(publicJwk)));
  return Array.from(new Uint8Array(bytes)).slice(0, 16).map(x => x.toString(16).padStart(2,'0')).join('').toUpperCase().match(/.{1,4}/g).join(' ');
}
