
export async function restoreKonnektKeyBackup(passphrase) {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) {
    throw new Error('Sign in before restoring your encryption key.');
  }

  if (String(passphrase || '').length < 12) {
    throw new Error('Use a recovery passphrase with at least 12 characters.');
  }

  const { data: row, error } = await supabase
    .from('user_key_backups')
    .select('ciphertext,salt,iv,iterations,key_version')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!row) throw new Error('No recovery backup exists for this account.');

  if (
    row.key_version !== 1 ||
    row.iterations < 100000 ||
    row.iterations > 1000000
  ) {
    throw new Error('This recovery backup version is not supported.');
  }

  const material = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromBase64(row.salt),
      iterations: row.iterations,
      hash: 'SHA-256'
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  let payload;

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: fromBase64(row.iv)
      },
      key,
      fromBase64(row.ciphertext)
    );

    payload = JSON.parse(decoder.decode(decrypted));
  } catch {
    throw new Error(
      'Recovery passphrase is incorrect or the backup is damaged.'
    );
  }

  if (
    payload.version !== 1 ||
    payload.userId !== user.id ||
    !payload.publicJwk ||
    !payload.privateKey
  ) {
    throw new Error(
      'Recovery backup does not match this signed-in account.'
    );
  }

  const publicKey = JSON.stringify(payload.publicJwk);

  const existingIdentity = await readKey(user.id);

  if (
    existingIdentity?.publicJwk &&
    JSON.stringify(existingIdentity.publicJwk) !== publicKey
  ) {
    throw new Error(
      'A different encryption identity is already stored on this device. No key was overwritten.'
    );
  }

  const { data: profile, error: profileReadError } =
    await supabase
      .from('profiles')
      .select('encryption_public_key')
      .eq('id', user.id)
      .maybeSingle();

  if (profileReadError) throw profileReadError;

  if (
    profile?.encryption_public_key &&
    profile.encryption_public_key !== publicKey
  ) {
    throw new Error(
      'This backup does not match the encryption key registered to your account.'
    );
  }

  // Keep the restored private key exportable so the user can
  // create or update their encrypted recovery backup later.
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    fromBase64(payload.privateKey),
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey']
  );

  await saveKey(user.id, {
    privateKey,
    publicJwk: payload.publicJwk
  });

  if (!profile?.encryption_public_key) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ encryption_public_key: publicKey })
      .eq('id', user.id);

    if (profileError) {
      throw new Error(
        `The local key was restored, but the profile update failed: ${profileError.message}`
      );
    }
  }

  return true;
}
