/* KONNEKT staging data layer. Supabase public client only; all authorization is enforced by RLS. */
(function(){
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cfg = window.KONNEKT_CONFIG || {};
  if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !K_backendConfig.url) {
    K_backendConfig = { url: cfg.SUPABASE_URL, anonKey: cfg.SUPABASE_ANON_KEY };
    K_backendSave();
  }
  let remoteConversationId = null, remoteConversationChannel = null, remoteChatsCache = [];
  const isConfigured = () => !!(K_backendConfig.url && K_backendConfig.anonKey);
  async function client(){ if(!isConfigured()) throw new Error('Connect a KONNEKT Supabase staging project first.'); return await K_loadSupabase(); }
  async function currentUser(){ const sb=await client(); const {data,error}=await sb.auth.getUser(); if(error) throw error; if(!data.user) throw new Error('Sign in with a real staging account first.'); return {sb,user:data.user}; }
  function setResult(id,msg){ const el=document.getElementById(id); if(el) el.textContent=msg; }
  function prettyTime(v){ try{return new Date(v).toLocaleString([], {dateStyle:'short',timeStyle:'short'});}catch(_){return '';} }

  // The chat list becomes a real, account-scoped view after staging sign-in.
  const baseRender = window.render;
  window.render = function(){ baseRender(); if(!isConfigured())return; if(page==='Chats') K_renderRemoteChats().catch(e=>{console.warn('KONNEKT chat load:',e);const root=document.getElementById('content');if(root&&page==='Chats')root.innerHTML=`${head('Chats','Sign in to your real KONNEKT staging account to see live conversations.','<button class="btn" onclick="K_accountPanel()">Account & sign in</button>')}<div class="card"><p class="muted">${esc(e.message||'Staging chat is not available.')}</p></div>`;}); if(page==='Discover')K_renderRemoteDiscover().catch(e=>console.warn('KONNEKT discover:',e)); if(page==='Reels')K_renderRemoteReels().catch(e=>console.warn('KONNEKT reels:',e)); if(page==='Status')K_renderRemoteStatuses().catch(e=>console.warn('KONNEKT statuses:',e)); if(page==='Calls')K_renderRemoteCalls().catch(e=>console.warn('KONNEKT calls:',e)); };
  window.K_renderRemoteChats = async function(){
    const root=document.getElementById('content'); if(!root || page!=='Chats') return;
    const {sb,user}=await currentUser();
    root.innerHTML = `${head('Chats','Your real KONNEKT conversations.','<button class="btn" onclick="K_openRemoteNewChat()">＋ New chat</button>')}<div class="card"><p class="muted small">Loading your conversations…</p></div>`;
    const {data:members,error:mErr}=await sb.from('conversation_members').select('conversation_id').eq('user_id',user.id);
    if(mErr) throw mErr;
    const ids=(members||[]).map(x=>x.conversation_id);
    if(!ids.length){root.innerHTML=`${head('Chats','Your real KONNEKT conversations.','<button class="btn" onclick="K_openRemoteNewChat()">＋ New chat</button>')}<div class="card"><p class="muted">No conversations yet. Start a chat using someone's KONNEKT username.</p></div>`;return;}
    const [{data:convs,error:cErr},{data:allMembers,error:amErr},{data:msgs,error:msgErr}]=await Promise.all([
      sb.from('conversations').select('id,title,created_at,is_group').in('id',ids).order('created_at',{ascending:false}),
      sb.from('conversation_members').select('conversation_id,user_id,profiles(display_name,username)').in('conversation_id',ids),
      sb.from('messages').select('id,conversation_id,sender_id,body,created_at').in('conversation_id',ids).order('created_at',{ascending:false}).limit(250)
    ]);
    if(cErr)throw cErr;if(amErr)throw amErr;if(msgErr)throw msgErr;
    remoteChatsCache=(convs||[]).map(c=>{
      const peers=(allMembers||[]).filter(m=>m.conversation_id===c.id&&m.user_id!==user.id);
      const peer=peers[0]?.profiles||{};
      const last=(msgs||[]).find(m=>m.conversation_id===c.id);
      return {...c,peerName:peer.display_name||peer.username||c.title||'KONNEKT member',peerUsername:peer.username||'',lastMessage:last?.body||'Start the conversation',lastAt:last?.created_at||c.created_at};
    });
    root.innerHTML=`${head('Chats','Your real KONNEKT conversations.','<button class="btn" onclick="K_openRemoteNewChat()">＋ New chat</button>')}<div class="card">${remoteChatsCache.map(c=>`<div class="chatrow" role="button" tabindex="0" onclick="K_openRemoteConversation('${c.id}')">${avatar(esc((c.peerName||'K').slice(0,2).toUpperCase()))}<div class="chatbody"><b>${esc(c.peerName)} ${c.peerUsername?`<small class="muted">@${esc(c.peerUsername)}</small>`:''}</b><p>${esc(c.lastMessage)}</p></div><div class="chatmeta">${esc(prettyTime(c.lastAt))}</div></div>`).join('')}</div>`;
  };
  window.K_openRemoteNewChat=function(){
    K_modal('Start a real KONNEKT chat',`<p class="auth-help">Enter the other person's unique KONNEKT username. They must have a verified staging account and profile.</p><label class="auth-label">KONNEKT username</label><input id="kRemoteUsername" class="field" maxlength="24" placeholder="e.g. amanda_01"><div id="kRemoteChatResult" class="auth-help"></div>`,'Start chat','K_createRemoteConversation()');
  };
  window.K_createRemoteConversation=async function(){
    try{const {sb}=await currentUser();const username=document.getElementById('kRemoteUsername')?.value.trim();if(!username)throw new Error('Enter a username.');
      const {data,error}=await sb.rpc('konnekt_start_direct_conversation',{target_username:username.replace(/^@/,'')});if(error)throw error;
      closeModal();await K_renderRemoteChats();await K_openRemoteConversation(data);
    }catch(e){setResult('kRemoteChatResult',e.message);if(!document.getElementById('kRemoteChatResult'))toast(e.message);}
  };
  window.K_openRemoteConversation=async function(id){
    try{
      const {sb,user}=await currentUser();remoteConversationId=id;
      const [{data:msgs,error:mErr},{data:members,error:memErr}]=await Promise.all([
        sb.from('messages').select('id,sender_id,body,created_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(300),
        sb.from('conversation_members').select('user_id,profiles(display_name,username)').eq('conversation_id',id)
      ]);
      if(mErr)throw mErr;if(memErr)throw memErr;
      const peer=(members||[]).find(m=>m.user_id!==user.id)?.profiles||{};
      const title=peer.display_name||peer.username||'KONNEKT chat';
      const renderMessages=(rows)=>rows.map(m=>`<div style="display:flex;justify-content:${m.sender_id===user.id?'flex-end':'flex-start'};margin:9px 0"><div style="max-width:85%;background:${m.sender_id===user.id?'#48206c':'#21162d'};padding:11px 13px;border-radius:13px"><div>${esc(m.body)}</div><small class="muted">${esc(prettyTime(m.created_at))}</small></div></div>`).join('');
      $('#modalbox').innerHTML=`<h2>${esc(title)}</h2><p class="muted small">Live staging conversation · messages are visible only to conversation members</p><div id="kRemoteThread" class="card" style="max-height:48vh;overflow:auto">${renderMessages(msgs||'')||'<p class="muted small">No messages yet. Say hello.</p>'}</div><div class="auth-actions"><button class="btn secondary" onclick="K_startLiveKitCall(\'audio\')">☎ Voice call</button><button class="btn secondary" onclick="K_startLiveKitCall(\'video\')">▣ Video call</button></div><label>Message</label><textarea id="kRemoteReply" class="field" rows="2" maxlength="10000" placeholder="Type a message…"></textarea><div class="modal-actions"><button class="btn ghost" onclick="K_closeRemoteConversation()">Close</button><button class="btn" onclick="K_sendRemoteReply()">Send</button></div>`;
      $('#modal').classList.add('show');const thread=$('#kRemoteThread');if(thread)thread.scrollTop=thread.scrollHeight;
      if(remoteConversationChannel){sb.removeChannel(remoteConversationChannel);remoteConversationChannel=null;}
      remoteConversationChannel=sb.channel('konnekt-chat-'+id).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'conversation_id=eq.'+id},payload=>{
        const row=payload.new;if(!row||row.sender_id===user.id)return;
        const t=$('#kRemoteThread');if(t){t.insertAdjacentHTML('beforeend',`<div style="display:flex;justify-content:flex-start;margin:9px 0"><div style="max-width:85%;background:#21162d;padding:11px 13px;border-radius:13px"><div>${esc(row.body)}</div><small class="muted">${esc(prettyTime(row.created_at))}</small></div></div>`);t.scrollTop=t.scrollHeight;}
      }).subscribe();
    }catch(e){toast('Could not open chat: '+e.message);}
  };
  window.K_sendRemoteReply=async function(){
    const body=$('#kRemoteReply')?.value.trim();if(!body){toast('Write a message first');return;}
    try{const {sb,user}=await currentUser();const {data:sentMessage,error}=await sb.from('messages').insert({conversation_id:remoteConversationId,sender_id:user.id,body}).select('id').single();if(error)throw error;sb.functions.invoke('send-push',{body:{message_id:sentMessage.id}}).catch(()=>{});await K_openRemoteConversation(remoteConversationId);}
    catch(e){toast('Message not sent: '+e.message);}
  };
  window.K_closeRemoteConversation=function(){if(remoteConversationChannel){K_loadSupabase().then(sb=>sb.removeChannel(remoteConversationChannel)).catch(()=>{});remoteConversationChannel=null;}closeModal();K_renderRemoteChats().catch(()=>{});};

  // Profile writes go to both local preview and the authenticated remote profile.
  const localSaveProfile=window.K_saveProfile;
  window.K_saveProfile=async function(){
    const n=$('#kName')?.value.trim(),u=$('#kUsername')?.value.trim().replace(/^@/,''),b=$('#kBio')?.value.trim(),f=$('#kProfileFile')?.files[0];
    if(!n||!u){toast('Name and username are required');return;}
    try{
      if(isConfigured()){
        const {sb,user}=await currentUser();let avatar_path=null;
        if(f){if(!f.type.startsWith('image/')||f.size>5*1024*1024)throw new Error('Profile photo must be an image up to 5 MB.');avatar_path=user.id+'/'+Date.now()+'-'+f.name.replace(/[^a-zA-Z0-9._-]/g,'_');const {error:upErr}=await sb.storage.from('konnekt-avatars').upload(avatar_path,f,{upsert:true,contentType:f.type});if(upErr)throw upErr;}
        const payload={id:user.id,display_name:n,username:u,bio:b||''};if(avatar_path)payload.avatar_path=avatar_path;
        const {error}=await sb.from('profiles').upsert(payload,{onConflict:'id'});if(error)throw error;
      }
      await localSaveProfile();
      const meEl=document.querySelector('.me');if(meEl)meEl.innerHTML=`<div class="avatar">${esc(n.slice(0,2).toUpperCase())}</div><div><b>${esc(n)}</b><small>@${esc(u)}</small></div>`;
      if(isConfigured())toast('Profile saved to KONNEKT staging and this device');
    }catch(e){toast('Profile not synced: '+e.message);}
  };

  // Upload a selected Reel as a private staging draft. Publishing remains an explicit later action.
  const localSaveReel=window.K_saveReelDraft;
  window.K_saveReelDraft=async function(){
    const f=$('#kReelFile')?.files[0],caption=$('#kReelCaption')?.value.trim()||'';
    if(!isConfigured()||!f){await localSaveReel();if(isConfigured()&&!f)toast('Text-only draft saved locally; add a video to upload it to staging.');return;}
    try{const {sb,user}=await currentUser();if(!f.type.startsWith('video/')||f.size>100*1024*1024)throw new Error('Choose a video up to 100 MB for staging.');
      const path=user.id+'/'+Date.now()+'-'+f.name.replace(/[^a-zA-Z0-9._-]/g,'_');const {error:upErr}=await sb.storage.from('konnekt-reels').upload(path,f,{upsert:false,contentType:f.type});if(upErr)throw upErr;
      const {error:dbErr}=await sb.from('reels').insert({user_id:user.id,caption,media_path:path,visibility:'private',published_at:null});if(dbErr){await sb.storage.from('konnekt-reels').remove([path]);throw dbErr;}
      await localSaveReel();toast('Reel draft uploaded to your private staging account');
    }catch(e){toast('Reel upload failed: '+e.message);}
  };

  // Status uploads are private, account-owned and expire after 24 hours in the database.
  const localSaveStatus=window.K_saveStatus;
  window.K_saveStatus=async function(){
    const f=$('#kStatusFile')?.files[0],caption=$('#kStatusText')?.value.trim()||'';
    if(!isConfigured()){localSaveStatus();return;}
    try{const {sb,user}=await currentUser();let media_path=null;
      if(f){if(!f.type.startsWith('image/')&&!f.type.startsWith('video/'))throw new Error('Choose an image or video.');if(f.size>100*1024*1024)throw new Error('Status media must be under 100 MB.');media_path=user.id+'/'+Date.now()+'-'+f.name.replace(/[^a-zA-Z0-9._-]/g,'_');const {error}=await sb.storage.from('konnekt-status').upload(media_path,f,{upsert:false,contentType:f.type});if(error)throw error;}
      const {error}=await sb.from('statuses').insert({user_id:user.id,caption,media_path,expires_at:new Date(Date.now()+24*60*60*1000).toISOString()});if(error){if(media_path)await sb.storage.from('konnekt-status').remove([media_path]);throw error;}
      localSaveStatus();toast('Status uploaded to your staging account; it expires after 24 hours');
    }catch(e){toast('Status upload failed: '+e.message);}
  };

  // Safety actions. The DB policies prevent a client from reviewing its own report as a moderator.
  window.K_reportAccount=async function(targetUserId,reason,details=''){
    try{const {sb,user}=await currentUser();const {error}=await sb.from('reports').insert({reporter_id:user.id,target_user_id:targetUserId,reason,details});if(error)throw error;toast('Report submitted. Thank you for helping keep KONNEKT safe.');}
    catch(e){toast('Report could not be submitted: '+e.message);}
  };
  window.K_blockAccount=async function(targetUserId){
    try{const {sb,user}=await currentUser();const {error}=await sb.from('blocked_users').upsert({blocker_id:user.id,blocked_id:targetUserId});if(error)throw error;await sb.from('follows').delete().or(`and(follower_id.eq.${user.id},followed_id.eq.${targetUserId}),and(follower_id.eq.${targetUserId},followed_id.eq.${user.id})`);toast('Account blocked.');}
    catch(e){toast('Could not block account: '+e.message);}
  };
  window.K_enablePushNotifications=async function(){
    try{if(!('serviceWorker'in navigator)||!('PushManager'in window))throw new Error('Push notifications are not supported by this browser.');const vapid=cfg.VAPID_PUBLIC_KEY;if(!vapid)throw new Error('Add the public VAPID key after configuring a trusted push provider.');
      const {sb,user}=await currentUser();const permission=await Notification.requestPermission();if(permission!=='granted')throw new Error('Notification permission was not granted.');const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(atob(vapid.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(vapid.length/4)*4,'=')),c=>c.charCodeAt(0))});
      const {error}=await sb.from('push_subscriptions').upsert({user_id:user.id,endpoint:sub.endpoint,subscription:sub.toJSON()},{onConflict:'user_id,endpoint'});if(error)throw error;toast('This device is registered for push notifications. Delivery still needs the trusted push sender configured.');
    }catch(e){toast('Push setup: '+e.message);}
  };
  window.K_exportRemoteAccount=async function(){try{const {sb}=await currentUser();const {data,error}=await sb.functions.invoke('export-account',{body:{}});if(error)throw error;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='konnekt-account-export.json';a.click();URL.revokeObjectURL(a.href);}catch(e){toast('Export failed: '+e.message);}};
  window.K_deleteRemoteAccount=async function(){if(!confirm('Permanently delete your KONNEKT staging account and associated data? This cannot be undone.'))return;try{const {sb}=await currentUser();const {error}=await sb.functions.invoke('delete-account',{body:{}});if(error)throw error;await sb.auth.signOut();toast('Staging account deleted.');K_authView='staging';K_accountPanel();}catch(e){toast('Account deletion failed: '+e.message);}};


  window.K_sbResendVerification=async function(){const email=$('#kSbEmail')?.value.trim();if(!email){K_sbResult('Enter the test email first.');return;}try{const sb=await client();const {error}=await sb.auth.resend({type:'signup',email});if(error)throw error;K_sbResult('If the account needs verification, a new confirmation email has been sent.');}catch(e){K_sbResult('Could not resend verification: '+e.message);}};
  window.K_setSupabasePassword=async function(){const password=$('#kNewRemotePassword')?.value,confirmPassword=$('#kNewRemotePasswordConfirm')?.value;if(!password||password.length<10){toast('Use at least 10 characters.');return;}if(password!==confirmPassword){toast('Passwords do not match.');return;}try{const sb=await client();const {error}=await sb.auth.updateUser({password});if(error)throw error;closeModal();toast('Your staging password has been updated.');}catch(e){toast('Password update failed: '+e.message);}};

  // Add an operational status panel and privacy actions to the existing account screen.
  const originalStaging=window.K_authStaging;
  window.K_authStaging=function(){return originalStaging()+`<div class="auth-panel" style="margin-top:12px"><h3>Real-world testing tools</h3><p class="auth-help">These tools require a real staging sign-in. Account export/deletion need their Edge Functions deployed.</p><div class="auth-actions"><button class="btn secondary" onclick="K_renderRemoteChats().catch(e=>toast(e.message))">Load real chats</button><button class="btn ghost" onclick="K_enablePushNotifications()">Enable push</button><button class="btn ghost" onclick="K_exportRemoteAccount()">Export account data</button><button class="btn ghost" onclick="K_deleteRemoteAccount()">Delete staging account</button></div><p class="auth-help">Do not use production or personal data until the two-account RLS test and Android device test pass.</p></div>`;};

  // Terms acceptance and display name are captured for real staging sign-up.
  window.K_sbSignUp=async function(){
    const checkbox=document.getElementById('kTermsAccept');
    if(checkbox && !checkbox.checked){K_sbResult('Please accept the testing Terms and Privacy Notice before creating an account.');return;}
    const email=$('#kSbEmail')?.value.trim(),password=$('#kSbPassword')?.value,name=$('#kSbDisplayName')?.value.trim();
    if(!email||!password||!name){K_sbResult('Enter display name, test email and password.');return;}
    if(password.length<10){K_sbResult('Use at least 10 characters for the test password.');return;}
    try{
      const sb=await client();
      localStorage.setItem('konnekt-consent-pending',JSON.stringify({terms:cfg.TERMS_VERSION||'2026-11-12',privacy:cfg.PRIVACY_VERSION||'2026-11-12',at:new Date().toISOString()}));
      const {data,error}=await sb.auth.signUp({email,password,options:{data:{display_name:name}}});
      if(error)throw error;
      if(data.session){const {error:consentError}=await sb.from('user_consents').upsert({user_id:data.user.id,terms_version:cfg.TERMS_VERSION||'2026-11-12',privacy_version:cfg.PRIVACY_VERSION||'2026-11-12',marketing_opt_in:false},{onConflict:'user_id'});if(consentError)console.warn('Consent record pending:',consentError.message);}
      K_sbResult(data.session?'Staging account created and signed in. Set a unique username in Edit profile.':'Sign-up accepted. Verify the email, then sign in.');
    }catch(e){K_sbResult('Sign-up failed: '+e.message);}
  };
  const oldStaging=window.K_authStaging;
  // Patch consent checkbox into the original staging sign-up panel string.
  const stagingSource=oldStaging.toString();
  window.K_authStaging=function(){let html=oldStaging();html=html.replace('<label class="auth-label">Test email</label>','<label class="auth-label">Display name</label><input id="kSbDisplayName" class="field" maxlength="80" placeholder="Your display name"><label class="auth-label">Test email</label>');return html.replace('<div class="auth-actions"><button class="btn" onclick="K_sbSignUp()">Staging sign up</button>','<label class="auth-label"><input id="kTermsAccept" type="checkbox"> I accept the <a href="./legal/TERMS_OF_TESTING.md" target="_blank">testing terms</a> and <a href="./legal/PRIVACY_NOTICE.md" target="_blank">privacy notice</a>.</label><div class="auth-actions"><button class="btn" onclick="K_sbSignUp()">Staging sign up</button>');};



  // Discover real staging profiles and follow graph (no sample/demo profiles shown).
  window.K_renderRemoteDiscover=async function(){
    const root=$('#content');if(!root||page!=='Discover')return;const {sb,user}=await currentUser();
    const {data:profiles,error}=await sb.from('profiles').select('id,display_name,username,bio,avatar_path').neq('id',user.id).order('created_at',{ascending:false}).limit(40);if(error)throw error;
    const {data:follows,error:fErr}=await sb.from('follows').select('followed_id').eq('follower_id',user.id);if(fErr)throw fErr;const following=new Set((follows||[]).map(x=>x.followed_id));
    const cards=await Promise.all((profiles||[]).map(async p=>{let img='';if(p.avatar_path){const {data}=await sb.storage.from('konnekt-avatars').createSignedUrl(p.avatar_path,300);img=data?.signedUrl||'';}return `<div class="person">${img?`<img src="${esc(img)}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover">`:avatar(esc((p.display_name||'K').slice(0,2).toUpperCase()))}<div class="person-info"><b>${esc(p.display_name||'KONNEKT member')}</b><small>@${esc(p.username||'')}</small><p class="muted small">${esc(p.bio||'')}</p></div><button class="btn secondary" onclick="K_toggleRemoteFollow('${p.id}',${following.has(p.id)})">${following.has(p.id)?'Following':'Follow'}</button><button class="iconbtn" title="More" onclick="K_remoteSafetyMenu('${p.id}','${esc(p.display_name||p.username||'member')}')">⋯</button></div>`;}));
    root.innerHTML=`${head('Discover','Find real people using KONNEKT staging.','<button class="btn ghost" onclick="K_accountPanel()">Account</button>')}<div class="card"><label class="auth-label">Search members</label><input id="kRemotePeopleSearch" class="field" placeholder="Search username or name" oninput="K_filterRemotePeople()"><div id="kRemotePeopleList">${cards.join('')||'<p class="muted">No other staging members yet. Invite your second test account.</p>'}</div></div>`;
  };
  window.K_filterRemotePeople=function(){const q=$('#kRemotePeopleSearch')?.value.toLowerCase()||'';document.querySelectorAll('#kRemotePeopleList .person').forEach(el=>el.style.display=el.textContent.toLowerCase().includes(q)?'flex':'none');};
  window.K_toggleRemoteFollow=async function(id,isFollowing){try{const {sb,user}=await currentUser();const result=isFollowing?await sb.from('follows').delete().eq('follower_id',user.id).eq('followed_id',id):await sb.from('follows').insert({follower_id:user.id,followed_id:id});if(result.error)throw result.error;await K_renderRemoteDiscover();}catch(e){toast('Follow action failed: '+e.message);}};
  window.K_remoteSafetyMenu=function(id,label){K_modal('Safety · KONNEKT account',`<p class="auth-help">Choose how to handle this account.</p><button class="btn ghost" onclick="K_blockRemoteUser('${id}')">Block account</button><button class="btn ghost" onclick="K_reportRemoteUser('${id}')">Report account</button>`,'Close');};
  window.K_blockRemoteUser=async function(id){if(!confirm('Block this account? They will not be able to interact with you through supported KONNEKT features.'))return;try{const {sb,user}=await currentUser();const {data:existing}=await sb.from('blocked_users').select('blocked_id').eq('blocker_id',user.id).eq('blocked_id',id).maybeSingle();if(!existing){const {error}=await sb.from('blocked_users').insert({blocker_id:user.id,blocked_id:id});if(error)throw error;}await sb.from('follows').delete().eq('follower_id',user.id).eq('followed_id',id);closeModal();toast('Account blocked.');await K_renderRemoteDiscover();}catch(e){toast('Block failed: '+e.message);}};
  window.K_reportRemoteUser=function(id){K_modal('Report account',`<label class="auth-label">Reason</label><select id="kReportReason" class="field"><option>Harassment</option><option>Spam</option><option>Impersonation</option><option>Hate or abuse</option><option>Other safety concern</option></select><label class="auth-label">Details (optional)</label><textarea id="kReportDetails" class="field" maxlength="3000"></textarea>`,'Submit report',`K_submitRemoteReport('${id}')`);};
  window.K_submitRemoteReport=async function(id){try{const {sb,user}=await currentUser();const reason=$('#kReportReason').value,details=$('#kReportDetails').value;const {error}=await sb.from('reports').insert({reporter_id:user.id,target_user_id:id,reason,details});if(error)throw error;closeModal();toast('Report submitted securely.');}catch(e){toast('Report failed: '+e.message);}};

  // Published reels are read from the server; private drafts remain visible only to their owner.
  window.K_renderRemoteReels=async function(){
    const root=$('#content');if(!root||page!=='Reels')return;const {sb,user}=await currentUser();
    const {data:rows,error}=await sb.from('reels').select('id,user_id,caption,media_path,visibility,published_at,created_at,profiles(display_name,username)').or(`published_at.not.is.null,user_id.eq.${user.id}`).order('created_at',{ascending:false}).limit(30);if(error)throw error;
    const cards=await Promise.all((rows||[]).map(async r=>{const {data}=await sb.storage.from('konnekt-reels').createSignedUrl(r.media_path,300);const signed=data?.signedUrl||'';const isMine=r.user_id===user.id;return `<article class="card" style="margin-bottom:14px"><div class="person-info"><b>${esc(r.profiles?.display_name||'KONNEKT creator')} <small class="muted">@${esc(r.profiles?.username||'')}</small></b><small>${r.published_at?'Published':'Private draft'} · ${esc(prettyTime(r.created_at))}</small></div>${signed?`<video src="${esc(signed)}" controls playsinline preload="metadata" style="width:100%;max-height:520px;border-radius:14px;background:#000;margin-top:10px"></video>`:'<p class="muted">Media unavailable or not permitted.</p>'}<p>${esc(r.caption||'')}</p><div class="auth-actions">${r.published_at?`<button class="btn ghost" onclick="K_toggleReelLike('${r.id}')">♡ Like</button><button class="btn ghost" onclick="K_remoteReelComment('${r.id}')">Comment</button><button class="btn ghost" onclick="K_reportRemoteReel('${r.id}')">Report</button>`:''}${isMine&&!r.published_at?`<button class="btn" onclick="K_publishRemoteReel('${r.id}')">Publish Reel</button>`:''}${isMine?`<button class="btn ghost" onclick="K_deleteRemoteReel('${r.id}','${esc(r.media_path)}')">Delete</button>`:''}</div></article>`;}));
    root.innerHTML=`${head('Reels','Real staging videos from KONNEKT members.','<button class="btn" onclick="openCreateReel()">＋ Upload Reel</button>')}<p class="auth-help">Only authenticated staging members can view this test feed. Public publishing is for controlled test content only.</p>${cards.join('')||'<div class="card"><p class="muted">No videos yet. Upload a test Reel to begin.</p></div>'}`;
  };
  window.K_publishRemoteReel=async function(id){if(!confirm('Publish this Reel to the staging test feed?'))return;try{const {sb,user}=await currentUser();const {error}=await sb.from('reels').update({visibility:'public',published_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id);if(error)throw error;toast('Reel published to staging.');await K_renderRemoteReels();}catch(e){toast('Could not publish: '+e.message);}};
  window.K_deleteRemoteReel=async function(id,path){if(!confirm('Delete this Reel and its uploaded video?'))return;try{const {sb,user}=await currentUser();if(path){const {error:mediaError}=await sb.storage.from('konnekt-reels').remove([path]);if(mediaError)throw mediaError;}const {error}=await sb.from('reels').delete().eq('id',id).eq('user_id',user.id);if(error)throw error;await K_renderRemoteReels();}catch(e){toast('Delete failed: '+e.message);}};
  window.K_toggleReelLike=async function(id){try{const {sb,user}=await currentUser();const {data}=await sb.from('reel_likes').select('reel_id').eq('reel_id',id).eq('user_id',user.id).maybeSingle();const result=data?await sb.from('reel_likes').delete().eq('reel_id',id).eq('user_id',user.id):await sb.from('reel_likes').insert({reel_id:id,user_id:user.id});if(result.error)throw result.error;toast(data?'Like removed':'Reel liked');}catch(e){toast('Like failed: '+e.message);}};
  window.K_remoteReelComment=async function(id){try{const {sb}=await currentUser();const {data,error}=await sb.from('reel_comments').select('body,created_at,profiles(display_name,username)').eq('reel_id',id).is('deleted_at',null).order('created_at',{ascending:true}).limit(50);if(error)throw error;const list=(data||[]).map(c=>`<div class="person"><div class="person-info"><b>${esc(c.profiles?.display_name||c.profiles?.username||'KONNEKT member')}</b><p>${esc(c.body)}</p><small>${esc(prettyTime(c.created_at))}</small></div></div>`).join('');K_modal('Reel comments',`${list||'<p class="muted small">No comments yet.</p>'}<textarea id="kRemoteReelComment" class="field" rows="3" maxlength="2000" placeholder="Write a comment…"></textarea>`,'Post comment',`K_submitRemoteReelComment('${id}')`);}catch(e){toast('Could not load comments: '+e.message);}};
  window.K_reportRemoteReel=function(id){K_modal('Report Reel',`<label class="auth-label">Reason</label><select id="kReelReportReason" class="field"><option>Harassment</option><option>Spam</option><option>Copyright concern</option><option>Hate or abuse</option><option>Other safety concern</option></select><label class="auth-label">Details (optional)</label><textarea id="kReelReportDetails" class="field" maxlength="3000"></textarea>`,'Submit report',`K_submitRemoteReelReport('${id}')`);};
  window.K_submitRemoteReelReport=async function(id){try{const {sb,user}=await currentUser();const reason=$('#kReelReportReason').value,details=$('#kReelReportDetails').value;const {error}=await sb.from('reports').insert({reporter_id:user.id,target_reel_id:id,reason,details});if(error)throw error;closeModal();toast('Reel report submitted.');}catch(e){toast('Report failed: '+e.message);}};
  window.K_submitRemoteReelComment=async function(id){try{const {sb,user}=await currentUser();const body=$('#kRemoteReelComment').value.trim();if(!body)throw new Error('Write a comment first.');const {error}=await sb.from('reel_comments').insert({reel_id:id,user_id:user.id,body});if(error)throw error;closeModal();toast('Comment posted.');}catch(e){toast('Comment failed: '+e.message);}};

  // Status feed uses short-lived signed URLs and server-enforced expiry.
  window.K_renderRemoteStatuses=async function(){
    const root=$('#content');if(!root||page!=='Status')return;const {sb,user}=await currentUser();const {data:rows,error}=await sb.from('statuses').select('id,user_id,caption,media_path,expires_at,created_at,profiles(display_name,username)').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(50);if(error)throw error;
    const cards=await Promise.all((rows||[]).map(async r=>{let media='';if(r.media_path){const {data}=await sb.storage.from('konnekt-status').createSignedUrl(r.media_path,180);const u=data?.signedUrl||'';media=u?`<a href="${esc(u)}" target="_blank" rel="noopener">Open status media</a>`:'';}return `<div class="person"><div class="person-info"><b>${esc(r.profiles?.display_name||'KONNEKT member')}</b><small>@${esc(r.profiles?.username||'')} · expires ${esc(prettyTime(r.expires_at))}</small><p>${esc(r.caption||'')}</p>${media}</div>${r.user_id===user.id?`<button class="btn ghost" onclick="K_deleteRemoteStatus('${r.id}')">Delete</button>`:''}</div>`;}));
    root.innerHTML=`${head('Status','Real status updates expire after 24 hours.','<button class="btn" onclick="openStatus()">＋ Add status</button>')}<div class="card">${cards.join('')||'<p class="muted">No active statuses from your test network yet.</p>'}</div>`;
  };
  window.K_deleteRemoteStatus=async function(id){if(!confirm('Delete this status?'))return;try{const {sb,user}=await currentUser();const {data:row}=await sb.from('statuses').select('media_path').eq('id',id).eq('user_id',user.id).maybeSingle();if(row?.media_path){const {error:mediaError}=await sb.storage.from('konnekt-status').remove([row.media_path]);if(mediaError)throw mediaError;}const {error}=await sb.from('statuses').delete().eq('id',id).eq('user_id',user.id);if(error)throw error;await K_renderRemoteStatuses();}catch(e){toast('Delete failed: '+e.message);}};


  window.K_renderRemoteCalls=async function(){
    const root=$('#content');if(!root||page!=='Calls')return;const {sb,user}=await currentUser();
    const {data:members,error}=await sb.from('conversation_members').select('conversation_id').eq('user_id',user.id);if(error)throw error;const ids=(members||[]).map(x=>x.conversation_id);
    if(!ids.length){root.innerHTML=`${head('Calls','Real voice and video calls with your KONNEKT contacts.','')}<div class="card"><p class="muted">Start a conversation first, then you can call that person.</p><button class="btn" onclick="setPage('Chats')">Open chats</button></div>`;return;}
    const [{data:convs,error:cErr},{data:allMembers,error:amErr}]=await Promise.all([sb.from('conversations').select('id,title,is_group').in('id',ids),sb.from('conversation_members').select('conversation_id,user_id,profiles(display_name,username)').in('conversation_id',ids)]);if(cErr)throw cErr;if(amErr)throw amErr;
    const rows=(convs||[]).map(c=>{const peer=(allMembers||[]).find(m=>m.conversation_id===c.id&&m.user_id!==user.id)?.profiles||{};return `<div class="person"><div class="person-info"><b>${esc(peer.display_name||peer.username||c.title||'KONNEKT group')}</b><small>@${esc(peer.username||'')} · secure conversation</small></div><button class="btn secondary" onclick="K_callFromList('${c.id}','audio')">☎ Voice</button><button class="btn" onclick="K_callFromList('${c.id}','video')">▣ Video</button></div>`;});
    root.innerHTML=`${head('Calls','Start a real LiveKit call from a conversation.','')}<p class="auth-help">Calls require the LiveKit staging service, microphone/camera permissions and a second conversation member to join the same room.</p><div class="card">${rows.join('')||'<p class="muted">No conversations available.</p>'}</div>`;
  };
  window.K_callFromList=function(id,kind){remoteConversationId=id;K_startLiveKitCall(kind);};

  // Live audio/video calls use LiveKit. The token is minted server-side after checking
  // conversation membership; API secrets never reach the browser.
  let liveRoom=null, liveKitModule=null;
  window.K_startLiveKitCall=async function(kind='audio'){
    try{
      if(!remoteConversationId)throw new Error('Open a real conversation first.');
      const {sb}=await currentUser();
      const {data,error}=await sb.functions.invoke('livekit-token',{body:{conversation_id:remoteConversationId}});
      if(error)throw error;if(!data?.token||!data?.server_url)throw new Error(data?.error||'LiveKit token unavailable.');
      if(!liveKitModule)liveKitModule=await import('https://cdn.jsdelivr.net/npm/livekit-client@2/+esm');
      const {Room,RoomEvent,Track}=liveKitModule;
      if(liveRoom){try{await liveRoom.disconnect()}catch(_){}}
      liveRoom=new Room({adaptiveStream:true,dynacast:true});
      $('#modalbox').innerHTML=`<h2>KONNEKT ${kind==='video'?'Video':'Voice'} Call</h2><p class="muted small">Connecting securely to your conversation…</p><div id="kLiveTiles" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;min-height:180px"></div><p id="kLiveStatus" class="auth-help">Requesting microphone${kind==='video'?' and camera':''} permission.</p><div class="modal-actions"><button class="btn" style="background:#c62828" onclick="K_endLiveKitCall()">End call</button></div>`;
      $('#modal').classList.add('show');
      liveRoom.on(RoomEvent.TrackSubscribed,(track,publication,participant)=>{const el=track.attach();el.style.width='100%';el.style.maxHeight='260px';el.style.borderRadius='12px';el.autoplay=true;el.playsInline=true;const tile=document.createElement('div');tile.appendChild(el);const label=document.createElement('small');label.className='muted';label.textContent=participant.identity;tile.appendChild(label);$('#kLiveTiles')?.appendChild(tile);});
      liveRoom.on(RoomEvent.Disconnected,()=>{const st=$('#kLiveStatus');if(st)st.textContent='Call disconnected.';});
      await liveRoom.connect(data.server_url,data.token);
      if(kind==='video')await liveRoom.localParticipant.enableCameraAndMicrophone();else await liveRoom.localParticipant.setMicrophoneEnabled(true);
      for(const pub of liveRoom.localParticipant.videoTrackPublications.values()){if(pub.track){const el=pub.track.attach();el.muted=true;el.style.width='100%';el.style.maxHeight='260px';el.style.borderRadius='12px';const tile=document.createElement('div');tile.appendChild(el);const label=document.createElement('small');label.className='muted';label.textContent='You';tile.appendChild(label);$('#kLiveTiles')?.appendChild(tile);}}
      const st=$('#kLiveStatus');if(st)st.textContent='Connected. The other participant can join by opening this conversation and starting a call.';
    }catch(e){toast('Call could not start: '+e.message);}
  };
  window.K_endLiveKitCall=async function(){if(liveRoom){try{await liveRoom.disconnect()}catch(_){}liveRoom=null;}closeModal();toast('Call ended');};


  window.K_privacy=function(){K_modal('Privacy & data',`<p class="small">KONNEKT staging mode stores account and social data in your connected Supabase project. Local preview data and locally selected media may also remain on this device.</p><ul class="auth-help"><li>Private chats are restricted to conversation members by database policies.</li><li>Private drafts and media are owner-only; published Reels and follower-only Status follow their audience settings.</li><li>Status content is designed to expire after 24 hours; scheduled cleanup must be enabled.</li><li>Account export and deletion require their deployed server functions.</li><li>Do not upload identity documents, financial details, intimate content or other sensitive information during testing.</li></ul><p><a href="./legal/PRIVACY_NOTICE.md" target="_blank">Read the staging privacy notice</a></p><p class="auth-help">This is an experimental test service, not a production privacy or security guarantee.</p>`,'Close');};
  window.K_settings=function(){K_modal('Settings & data',`<p class="small">Manage this device's preview data and your staging account.</p><div class="auth-actions"><button class="btn ghost" onclick="K_exportData()">Export local preview data</button><button class="btn ghost" onclick="K_clearData()">Reset local preview data</button><button class="btn secondary" onclick="K_accountPanel()">Account & backend</button></div><p class="auth-help">For remote account export or deletion, open Account & backend → Connect staging.</p>`,'Close');};

  // Session-aware topbar identity and initial remote session recovery.
  async function init(){
    if(!isConfigured())return;
    try{const sb=await client();sb.auth.onAuthStateChange((_event,session)=>{const me=session?.user;const el=document.querySelector('.me');if(me){const name=me.user_metadata?.display_name||me.email||'KONNEKT member';if(el)el.innerHTML=`<div class="avatar">${esc(name.slice(0,2).toUpperCase())}</div><div><b>${esc(name)}</b><small>${esc(me.email||'')}</small></div>`;render();if(_event==='PASSWORD_RECOVERY')K_modal('Set a new password',`<label class="auth-label">New password</label><input id="kNewRemotePassword" class="field" type="password" autocomplete="new-password" placeholder="At least 10 characters"><label class="auth-label">Confirm new password</label><input id="kNewRemotePasswordConfirm" class="field" type="password" autocomplete="new-password" placeholder="Repeat password">`,'Update password','K_setSupabasePassword()');}else{if(el)el.innerHTML='<div class="avatar">YO</div><div><b>Your Name</b><small>@yourusername</small></div>';if(remoteConversationChannel){sb.removeChannel(remoteConversationChannel);remoteConversationChannel=null;}remoteConversationId=null;render();}});
      const {data}=await sb.auth.getSession();if(data.session){const pending=localStorage.getItem('konnekt-consent-pending');if(pending){try{const v=JSON.parse(pending);await sb.from('user_consents').upsert({user_id:data.session.user.id,terms_version:v.terms,privacy_version:v.privacy,marketing_opt_in:false},{onConflict:'user_id'});localStorage.removeItem('konnekt-consent-pending');}catch(e){console.warn('Consent record pending:',e.message);}}const u=data.session.user;const profile=await sb.from('profiles').select('display_name,username').eq('id',u.id).maybeSingle();const name=profile.data?.display_name||u.user_metadata?.display_name||u.email||'KONNEKT member';const el=document.querySelector('.me');if(el)el.innerHTML=`<div class="avatar">${esc(name.slice(0,2).toUpperCase())}</div><div><b>${esc(name)}</b><small>${esc(profile.data?.username?'@'+profile.data.username:u.email||'')}</small></div>`;render();}
    }catch(e){console.warn('KONNEKT staging not ready:',e.message);}
  }
  init();
})();
