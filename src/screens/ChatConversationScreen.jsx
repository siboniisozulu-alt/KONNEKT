const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
const unique = crypto.randomUUID();

const encryptedPath =
  `${conversationId}/${user.id}/${unique}-${safeName}.enc`;

const { error: uploadError } = await supabase.storage
  .from('konnekt-chat-media')
  .upload(encryptedPath, encryptedFile.blob, {
    upsert: false,
    contentType: 'application/octet-stream'
  });

if (uploadError) throw uploadError;

await send({
  media_path: encryptedPath,
  media_type: file.type.startsWith('video/')
    ? 'video'
    : file.type.startsWith('audio/')
      ? 'audio'
      : 'image',
  media_encrypted: true,
  media_encryption_iv: encryptedFile.iv,
  media_mime_type: file.type
});
