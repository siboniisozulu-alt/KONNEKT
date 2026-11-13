const CACHE='konnekt-realworld-staging-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./config.js','./backend.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request;const url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}return response;}).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
});
self.addEventListener('push',event=>{
  let payload={title:'KONNEKT',body:'You have a new notification.',url:'/'};
  try{if(event.data)payload={...payload,...event.data.json()};}catch(_){if(event.data)payload.body=event.data.text();}
  event.waitUntil(self.registration.showNotification(payload.title,{body:payload.body,icon:'./icon.svg',badge:'./icon.svg',data:{url:payload.url||'/'},tag:payload.tag||'konnekt-notification'}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();const target=new URL(event.notification.data?.url||'/',self.location.origin).href;event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const client of list){if(client.url.startsWith(self.location.origin)){client.focus();client.navigate(target);return;}}return self.clients.openWindow(target);}));});
