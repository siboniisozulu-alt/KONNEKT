import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { chooseMedia, uploadMedia } from '../services/media';

export default function ChatConversationScreen({ navigation, route }) {
  const { user } = useAuth();
  const conversationId = route?.params?.chatId;
  const chatName = route?.params?.chatName || 'KONNEKT Friend';
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [peerId, setPeerId] = useState(null);
  const [peerUsername, setPeerUsername] = useState('');

  const markRead = useCallback(async rows => {
    if (!user?.id || !rows?.length) return;
    const incoming = rows.filter(m => m.sender_id !== user.id).map(m => ({
      message_id: m.id, user_id: user.id, delivered_at: new Date().toISOString(), read_at: new Date().toISOString()
    }));
    if (incoming.length) {
      const { error } = await supabase.from('message_receipts').upsert(incoming, { onConflict: 'message_id,user_id' });
      if (error) console.warn('KONNEKT receipts:', error.message);
    }
  }, [user?.id]);

  const load = useCallback(async () => {
    if (!conversationId || !user?.id) { setBusy(false); return; }
    const { data, error } = await supabase.from('messages')
      .select('*, message_receipts(user_id,delivered_at,read_at)')
      .eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(300);
    if (error) setNotice(error.message);
    else { setMessages(data || []); await markRead(data || []); }
    setBusy(false);
  }, [conversationId, user?.id, markRead]);

  useEffect(() => {
    load();
    if (!conversationId) return;
    const channel = supabase.channel(`messages-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, async payload => {
        setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
        await markRead([payload.new]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_receipts' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, conversationId, markRead]);

  useEffect(() => {
    let live = true;
    const findPeer = async () => {
      if (!conversationId || !user?.id) return;
      const { data: members } = await supabase.from('conversation_members').select('user_id').eq('conversation_id', conversationId).neq('user_id', user.id).limit(1);
      const id = members?.[0]?.user_id;
      if (!id || !live) return;
      setPeerId(id);
      const { data: profile } = await supabase.from('profiles').select('username,full_name').eq('id', id).maybeSingle();
      if (live) setPeerUsername(profile?.username ? `@${profile.username}` : '');
    };
    findPeer();
    return () => { live = false; };
  }, [conversationId, user?.id]);

  const send = async (extra = {}) => {
    const body = message.trim();
    if ((!body && !extra.media_path) || !conversationId || !user?.id || sending) return;
    setSending(true); setNotice('');
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversationId, sender_id: user.id,
      body: body || (extra.media_type === 'image' ? 'Photo' : extra.media_type === 'audio' ? 'Voice note' : 'Attachment'),
      ...extra
    }).select().single();
    if (error) { setNotice(error.message); setSending(false); return; }
    setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
    setMessage('');
    // Push is best-effort; message persistence must not depend on push provider availability.
    const { data: members } = await supabase.from('conversation_members').select('user_id').eq('conversation_id', conversationId).neq('user_id', user.id);
    const recipientIds = (members || []).map(m => m.user_id);
    if (recipientIds.length) {
      const { error: pushError } = await supabase.functions.invoke('send-push', {
        body: { conversationId, recipientIds, title: chatName, message: body || 'You received an attachment', url: `${window.location.origin}/KONNEKT/` }
      });
      if (pushError) console.info('KONNEKT push not delivered:', pushError.message);
    }
    setSending(false);
  };

  const attach = async () => {
    try {
      const file = await chooseMedia('image/*,video/*,audio/*');
      if (!file) return;
      setSending(true);
      const uploaded = await uploadMedia(file, 'konnekt-chat-media', `${conversationId}/${user.id}`);
      await send({ media_path: uploaded.path, media_type: uploaded.type });
    } catch (e) { setNotice(e.message); setSending(false); }
  };

  const startCall = callType => {
    if (!peerId) { setNotice('A call recipient could not be found for this conversation.'); return; }
    navigation.navigate('Call', { calleeId: peerId, conversationId, callType, contact: { name: chatName, username: peerUsername } });
  };

  const render = ({ item }) => {
    const mine = item.sender_id === user?.id;
    const receiptRows = item.message_receipts || [];
    const readCount = receiptRows.filter(r => r.read_at).length;
    const deliveredCount = receiptRows.filter(r => r.delivered_at).length;
    const receipt = readCount ? '✓✓ Read' : deliveredCount ? '✓ Delivered' : '✓ Sent';
    return <View style={[s.row, mine ? s.mine : s.theirs]}>
      <View style={[s.bubble, mine ? s.myBubble : s.otherBubble]}>
        {item.media_path ? <ChatAttachment path={item.media_path} type={item.media_type} /> : null}
        <Text style={s.message}>{item.body}</Text>
        <Text style={s.time}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        {mine ? <Text style={s.receipt}>{receipt}</Text> : null}
      </View>
    </View>;
  };

  return <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={s.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>‹</Text></TouchableOpacity>
      <View style={{ flex: 1 }}><Text style={s.name}>{chatName}</Text><Text style={s.sub}>Message delivery and read receipts enabled</Text></View>
      <TouchableOpacity onPress={() => startCall('voice')} style={s.headerButton}><Text style={s.headerIcon}>☎</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => startCall('video')} style={s.headerButton}><Text style={s.headerIcon}>▣</Text></TouchableOpacity>
      <TouchableOpacity onPress={attach}><Text style={s.attach}>＋</Text></TouchableOpacity>
    </View>
    {busy ? <ActivityIndicator color="#168BFF" style={{ marginTop: 30 }} /> : <FlatList style={{ flex: 1 }} data={messages} keyExtractor={x => x.id} renderItem={render} contentContainerStyle={{ padding: 14 }} />}
    <View style={s.composer}>
      <TouchableOpacity onPress={attach} style={s.clip}><Text style={{ fontSize: 21 }}>📎</Text></TouchableOpacity>
      <TextInput style={s.input} value={message} onChangeText={setMessage} placeholder="Message..." placeholderTextColor="#8293A8" multiline />
      <TouchableOpacity disabled={sending} style={s.send} onPress={() => send()}>{sending ? <ActivityIndicator color="#FFF" /> : <Text style={s.sendText}>➤</Text>}</TouchableOpacity>
    </View>
    {!!notice && <Text style={s.error}>{notice}</Text>}
  </KeyboardAvoidingView>;
}

function ChatAttachment({ path, type }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let live = true;
    supabase.storage.from('konnekt-chat-media').createSignedUrl(path, 3600).then(({ data, error }) => { if (live && !error) setUrl(data.signedUrl); });
    return () => { live = false; };
  }, [path]);
  if (!url) return <Text style={{ color: '#DCE8F7' }}>Loading attachment…</Text>;
  if (type === 'audio') return <audio src={url} controls style={{ width: '220px', marginBottom: 8 }} />;
  if (type === 'image') return <Image source={{ uri: url }} style={{ width: 220, height: 180, borderRadius: 10, marginBottom: 5 }} resizeMode="cover" />;
  return <TouchableOpacity onPress={() => window.open(url, '_blank', 'noopener,noreferrer')}><Text style={{ color: '#8BD0FF', padding: 10 }}>▶ Open video attachment</Text></TouchableOpacity>;
}
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#07111F'},header:{backgroundColor:'#14243A',padding:12,paddingTop:20,flexDirection:'row',alignItems:'center',gap:9},
  back:{color:'#168BFF',fontSize:32},name:{color:'#FFF',fontSize:16,fontWeight:'bold'},sub:{color:'#91A4BA',fontSize:10,marginTop:3},
  attach:{color:'#168BFF',fontSize:27},headerButton:{width:34,height:34,borderRadius:17,backgroundColor:'#203753',alignItems:'center',justifyContent:'center'},headerIcon:{color:'#FFF',fontSize:17},
  row:{flexDirection:'row',marginBottom:10},mine:{justifyContent:'flex-end'},theirs:{justifyContent:'flex-start'},bubble:{maxWidth:'84%',padding:11,borderRadius:14},
  myBubble:{backgroundColor:'#124D79',borderBottomRightRadius:3},otherBubble:{backgroundColor:'#182D46',borderBottomLeftRadius:3},
  message:{color:'#FFF',fontSize:14,lineHeight:20},time:{color:'#B4C4D6',fontSize:9,textAlign:'right',marginTop:5},receipt:{color:'#8FCBFF',fontSize:9,textAlign:'right',marginTop:2},
  composer:{flexDirection:'row',alignItems:'center',padding:10,backgroundColor:'#14243A',gap:8},clip:{padding:6},
  input:{flex:1,backgroundColor:'#203753',borderRadius:20,paddingHorizontal:14,paddingVertical:10,color:'#FFF',maxHeight:100},
  send:{width:42,height:42,borderRadius:21,backgroundColor:'#168BFF',alignItems:'center',justifyContent:'center'},sendText:{color:'#FFF',fontSize:20},error:{color:'#FF9CA8',padding:8}
});
