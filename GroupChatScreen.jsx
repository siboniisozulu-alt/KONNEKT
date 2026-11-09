import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';

export default function GroupChatScreen({ navigation, route }) {
  const { user } = useAuth();
  const group = route?.params?.group || { id: route?.params?.groupId || '', name: route?.params?.groupName || 'Group', members: [] };
  const conversationId = group.id || route?.params?.conversationId;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [busy, setBusy] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const flatListRef = useRef(null);

  const markRead = useCallback(async (rows) => {
    if (!user?.id || !rows?.length) return;
    const ids = rows.filter(m => m.sender_id !== user.id).map(m => m.id);
    if (!ids.length) return;
    const receipts = ids.map(message_id => ({ message_id, user_id: user.id, delivered_at: new Date().toISOString(), read_at: new Date().toISOString() }));
    const { error } = await supabase.from('message_receipts').upsert(receipts, { onConflict: 'message_id,user_id' });
    if (error) console.warn('KONNEKT read receipts:', error.message);
  }, [user?.id]);

  const load = useCallback(async () => {
    if (!conversationId || !user?.id) { setBusy(false); return; }
    const { data, error } = await supabase.from('messages').select('*, message_receipts(user_id,delivered_at,read_at)').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(300);
    if (error) setNotice(error.message);
    else { setMessages(data || []); await markRead(data || []); }
    setBusy(false);
  }, [conversationId, user?.id, markRead]);

  useEffect(() => {
    load();
    if (!conversationId) return;
    const channel = supabase.channel(`konnekt-group-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, async payload => {
        setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
        await markRead([payload.new]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_receipts' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, load, markRead]);

  useEffect(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, [messages]);

  const sendMessage = async () => {
    const body = messageText.trim();
    if (!body || !conversationId || !user?.id || sending) return;
    setSending(true); setNotice('');
    const { data, error } = await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, body }).select().single();
    if (error) setNotice(error.message);
    else {
      setMessageText('');
      setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
      const { data: members } = await supabase.from('conversation_members').select('user_id').eq('conversation_id', conversationId).neq('user_id', user.id);
      const recipientIds = (members || []).map(m => m.user_id);
      if (recipientIds.length) {
        const { error: pushError } = await supabase.functions.invoke('send-push', {
          body: { conversationId, recipientIds, title: group.name, message: body, url: `${window.location.origin}/KONNEKT/` }
        });
        if (pushError) console.info('KONNEKT group push not delivered:', pushError.message);
      }
    }
    setSending(false);
  };

  const renderMessage = ({ item }) => {
    const mine = item.sender_id === user?.id;
    const readCount = (item.message_receipts || []).filter(r => r.read_at).length;
    const deliveredCount = (item.message_receipts || []).filter(r => r.delivered_at).length;
    const receipt = mine ? (readCount ? `✓✓ Read by ${readCount}` : deliveredCount ? `✓ Delivered to ${deliveredCount}` : '✓ Sent') : '';
    return <View style={[styles.messageRow, mine ? styles.myMessageRow : styles.otherMessageRow]}>
      <View style={[styles.messageBubble, mine ? styles.myBubble : styles.otherBubble]}>
        {!mine ? <Text style={styles.senderName}>{item.sender_name || 'Group member'}</Text> : null}
        <Text style={[styles.messageText, mine && styles.myMessageText]}>{item.body}</Text>
        <Text style={[styles.messageTime, mine && styles.myMessageTime]}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        {mine ? <Text style={styles.receipt}>{receipt}</Text> : null}
      </View>
    </View>;
  };

  const openGroupInfo = () => navigation.navigate('GroupInfo', { group });
  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹</Text></TouchableOpacity>
      <TouchableOpacity style={styles.groupHeader} onPress={openGroupInfo}>
        <View style={styles.groupAvatar}><Text style={styles.groupAvatarText}>👥</Text></View>
        <View style={styles.groupDetails}><Text style={styles.groupName}>{group.name}</Text><Text style={styles.memberCount}>Group conversation</Text></View>
      </TouchableOpacity>
      <TouchableOpacity onPress={openGroupInfo}><Text style={styles.moreButton}>•••</Text></TouchableOpacity>
    </View>
    {busy ? <ActivityIndicator color="#168BFF" style={{ marginTop: 30 }} /> : <FlatList ref={flatListRef} data={messages} keyExtractor={item => item.id} renderItem={renderMessage} contentContainerStyle={styles.messageList} ListEmptyComponent={<Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>} />}
    {!!notice ? <Text style={styles.notice}>{notice}</Text> : null}
    <View style={styles.inputContainer}>
      <TextInput style={styles.messageInput} placeholder="Message group..." placeholderTextColor="#888" value={messageText} onChangeText={setMessageText} multiline maxLength={2000} />
      <TouchableOpacity disabled={sending || !messageText.trim()} style={styles.sendButton} onPress={sendMessage}><Text style={styles.sendButtonText}>{sending ? '…' : '➤'}</Text></TouchableOpacity>
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#07111F'},header:{height:68,backgroundColor:'#14243A',flexDirection:'row',alignItems:'center',paddingHorizontal:12},
  backButton:{color:'#168BFF',fontSize:30,paddingHorizontal:7},groupHeader:{flex:1,flexDirection:'row',alignItems:'center',marginLeft:8},
  groupAvatar:{width:42,height:42,borderRadius:21,backgroundColor:'#203753',justifyContent:'center',alignItems:'center'},groupAvatarText:{fontSize:20},
  groupDetails:{marginLeft:10},groupName:{color:'#FFF',fontWeight:'bold',fontSize:15},memberCount:{color:'#9AABC0',fontSize:11,marginTop:3},
  moreButton:{color:'#FFF',fontSize:19,paddingHorizontal:8},messageList:{padding:12,paddingBottom:18},messageRow:{flexDirection:'row',marginVertical:4},
  myMessageRow:{justifyContent:'flex-end'},otherMessageRow:{justifyContent:'flex-start'},messageBubble:{maxWidth:'84%',padding:10,borderRadius:12,minWidth:100},
  myBubble:{backgroundColor:'#124D79',borderTopRightRadius:3},otherBubble:{backgroundColor:'#182D46',borderTopLeftRadius:3},
  senderName:{color:'#76C2FF',fontSize:12,fontWeight:'bold',marginBottom:5},messageText:{color:'#FFF',fontSize:15,lineHeight:21},
  myMessageText:{color:'#FFF'},messageTime:{color:'#B4C4D6',fontSize:10,textAlign:'right',marginTop:5},myMessageTime:{color:'#B4C4D6'},
  receipt:{color:'#8FCBFF',fontSize:9,textAlign:'right',marginTop:3},inputContainer:{flexDirection:'row',alignItems:'flex-end',backgroundColor:'#14243A',padding:9},
  messageInput:{flex:1,backgroundColor:'#203753',borderRadius:22,paddingHorizontal:16,paddingVertical:10,color:'#FFF',maxHeight:110,fontSize:14},
  sendButton:{width:44,height:44,borderRadius:22,backgroundColor:'#168BFF',justifyContent:'center',alignItems:'center',marginLeft:8},sendButtonText:{color:'#FFF',fontSize:20,fontWeight:'bold'},
  emptyText:{color:'#9AABC0',textAlign:'center',marginTop:40},notice:{color:'#FF9CA8',padding:8}
});
