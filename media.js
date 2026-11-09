import { supabase } from '../lib_supabase';

async function compressVideoForUpload(file) {
  if (!file?.type?.startsWith('video/') || file.size < 10 * 1024 * 1024 || typeof document === 'undefined' || typeof MediaRecorder === 'undefined') return file;
  const canCapture = HTMLCanvasElement.prototype.captureStream;
  if (!canCapture) return file;
  const video = document.createElement('video');
  const objectUrl = URL.createObjectURL(file);
  video.src = objectUrl; video.playsInline = true; video.muted = false; video.preload = 'auto';
  try {
    await new Promise((resolve, reject) => { video.onloadedmetadata = resolve; video.onerror = () => reject(new Error('Video could not be decoded for compression.')); });
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth || 1280, video.videoHeight || 720));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, Math.round((video.videoWidth || 1280) * scale / 2) * 2);
    canvas.height = Math.max(2, Math.round((video.videoHeight || 720) * scale / 2) * 2);
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(24);
    const sourceStream = video.captureStream?.() || video.mozCaptureStream?.();
    (sourceStream?.getAudioTracks?.() || []).forEach(track => stream.addTrack(track));
    const mimeType = ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(type => MediaRecorder.isTypeSupported(type));
    if (!mimeType) return file;
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2200000, audioBitsPerSecond: 96000 });
    const chunks = [];
    const done = new Promise((resolve, reject) => {
      recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
      recorder.onerror = () => reject(recorder.error || new Error('Video compression failed.'));
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });
    const draw = () => { if (!video.paused && !video.ended) { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); requestAnimationFrame(draw); } };
    recorder.start(1000);
    await video.play();
    draw();
    await new Promise(resolve => { video.onended = resolve; });
    if (recorder.state !== 'inactive') recorder.stop();
    const blob = await done;
    const result = new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webm`, { type: blob.type, lastModified: Date.now() });
    return result.size > 0 && result.size < file.size ? result : file;
  } catch { return file; }
  finally { try { video.pause(); } catch {} URL.revokeObjectURL(objectUrl); }
}

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
  file = await compressVideoForUpload(file);
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const maxBytes = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error(isVideo ? 'Video is still larger than 50 MB after compression. Choose a shorter or smaller clip.' : 'Images and audio must be 15 MB or smaller.');
  if (!isVideo && !isAudio && !file.type.startsWith('image/')) throw new Error('Choose an image, video or audio file.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const unique = globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const path = `${folder}/${unique}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const type = isVideo ? 'video' : isAudio ? 'audio' : 'image';
  if (bucket === 'konnekt-public-media') {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { path, url: data.publicUrl, type };
  }
  const { data, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signedError) throw signedError;
  return { path, url: data.signedUrl, type };
}
