import { supabase } from '../lib_supabase';

export function chooseMedia(accept = 'image/*,video/*') {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return reject(new Error('File selection is available in the web app.'));
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] || null);
    input.onerror = () => reject(new Error('Could not open the file picker.'));
    input.click();
  });
}

export async function uploadMedia(file, bucket = 'konnekt-public-media', folder = 'uploads') {
  if (!file) return null;
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isImage = file.type.startsWith('image/');
  const isDocument = /^(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.|vnd\.ms-excel|vnd\.ms-powerpoint)|text\/plain)$/.test(file.type) || /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i.test(file.name || '');
  const maxBytes = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error(isVideo ? 'Videos must be 45 MB or smaller on this free-tier setup.' : 'Images, audio and documents must be 15 MB or smaller.');
  if (!isVideo && !isAudio && !isImage && !isDocument) throw new Error('Choose an image, video, audio file or supported document (PDF, Office or TXT).');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const unique = globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const path = `${folder}/${unique}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' });
  if (error) throw error;
  const type = isVideo ? 'video' : isAudio ? 'audio' : isImage ? 'image' : 'document';
  if (bucket === 'konnekt-public-media') {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { path, url: data.publicUrl, type };
  }
  const { data, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signedError) throw signedError;
  return { path, url: data.signedUrl, type };
}
