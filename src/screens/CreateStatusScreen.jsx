import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { chooseMedia, uploadMedia } from '../services/media';

export default function CreateStatusScreen({ navigation }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const pick = async () => {
    try { const selected = await chooseMedia('image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime'); if (selected) setFile(selected); }
    catch (error) { setNotice(error.message || 'Could not select media.'); }
  };
  const publish = async () => {
    if (!user?.id) { setNotice('Please sign in again to publish a status.'); return; }
    if (!text.trim() && !file) { setNotice('Write an update or attach a photo or video.'); return; }
    if (file && !file.type?.startsWith('image/') && !file.type?.startsWith('video/')) { setNotice('Choose a photo or video.'); return; }
    if (file && file.size > (file.type.startsWith('video/') ? 45 : 15) * 1024 * 1024) { setNotice(file.type.startsWith('video/') ? 'Choose a video smaller than 45 MB.' : 'Choose an image smaller than 15 MB.'); return; }
    setBusy(true); setNotice('');
    try {
      let media = null;
      if (file) media = await uploadMedia(file, 'konnekt-public-media', `statuses/${user.id}`);
      const { error } = await supabase.from('statuses').insert({ user_id: user.id, text_content: text.trim() || null, media_url: media?.url || null, media_type: media?.type || 'text', expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
      if (error) throw error;
      navigation.goBack();
    } catch (error) { setNotice(error.message || 'Could not publish your status.'); }
    finally { setBusy(false); }
  };
  return <View style={s.container}>
    <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>‹ Back to Status</Text></TouchableOpacity>
    <Text style={s.title}>Create a status</Text>
    <Text style={s.hint}>Share a thought, photo or short video. Your status expires after 24 hours.</Text>
    <TextInput style={s.input} value={text} onChangeText={setText} multiline maxLength={700} placeholder="What's happening?" placeholderTextColor="#BBA9CC"/>
    <TouchableOpacity style={s.secondary} onPress={pick}><Text style={s.secondaryText}>＋ Add photo or video</Text></TouchableOpacity>
    {!!file && <View style={s.fileRow}><Text style={s.file} numberOfLines={1}>{file.name}</Text><TouchableOpacity onPress={() => setFile(null)}><Text style={s.remove}>Remove</Text></TouchableOpacity></View>}
    <TouchableOpacity style={[s.publish, busy && { opacity: 0.65 }]} onPress={publish} disabled={busy}>{busy ? <ActivityIndicator color="#FFF"/> : <Text style={s.publishText}>PUBLISH STATUS</Text>}</TouchableOpacity>
    {!!notice && <Text style={s.error}>{notice}</Text>}
  </View>;
}
const s=StyleSheet.create({container:{flex:1,backgroundColor:'#10091B',padding:20},back:{color:'#6A0DAD',fontSize:16,marginTop:20},title:{color:'#FFF',fontSize:27,fontWeight:'bold',marginTop:24,marginBottom:8},hint:{color:'#BBA9CC',fontSize:12,lineHeight:19,marginBottom:18},input:{backgroundColor:'#241630',color:'#FFF',borderRadius:14,padding:16,minHeight:150,textAlignVertical:'top',borderWidth:1,borderColor:'#39244B'},secondary:{borderWidth:1,borderColor:'#6A0DAD',borderRadius:12,padding:15,alignItems:'center',marginTop:15},secondaryText:{color:'#D8B8F5',fontWeight:'bold'},fileRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,marginTop:12},file:{color:'#B8C8D9',flex:1},remove:{color:'#FF8795',fontWeight:'bold'},publish:{backgroundColor:'#6A0DAD',borderRadius:12,padding:16,alignItems:'center',marginTop:22},publishText:{color:'#FFF',fontWeight:'bold'},error:{color:'#FF8795',marginTop:12,lineHeight:19}});
