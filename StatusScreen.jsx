import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';

export default function StatusScreen({ navigation }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    if (!user?.id) { setBusy(false); return; }
    setBusy(true); setNotice('');
    try {
      const { data, error } = await supabase.from('statuses').select('id,user_id,text_content,media_url,media_type,created_at,expires_at').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(150);
      if (error) throw error;
      const ids = [...new Set((data || []).map(row => row.user_id))];
      const { data: profiles, error: profileError } = ids.length
        ? await supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', ids)
        : { data: [], error: null };
      if (profileError) throw profileError;
      const profileMap = Object.fromEntries((profiles || []).map(profile => [profile.id, profile]));
      setRows((data || []).map(row => ({ ...row, profile: profileMap[row.user_id] || {} })));
    } catch (error) { setNotice(`Could not load statuses: ${error.message || 'Please refresh.'}`); }
    finally { setBusy(false); }
  }, [user?.id]);

  useEffect(() => {
    load();
    const channel = supabase.channel(`konnekt-status-${user?.id || 'guest'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'statuses' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, user?.id]);

  const myRows = rows.filter(row => row.user_id === user?.id);
  const otherRows = rows.filter(row => row.user_id !== user?.id);
  const renderStatus = ({ item }) => {
    const name = item.profile?.full_name || (item.profile?.username ? `@${item.profile.username}` : 'KONNEKT member');
    return <TouchableOpacity style={s.item} onPress={() => navigation.navigate('StatusViewer', { status: item })} accessibilityRole="button">
      <View style={s.avatarWrap}>{item.profile?.avatar_url ? <Image source={{ uri: item.profile.avatar_url }} style={s.pic}/> : <View style={s.avatar}><Text style={s.avatarText}>{name.slice(0,1).toUpperCase()}</Text></View>}</View>
      <View style={{ flex: 1, minWidth: 0 }}><Text style={s.name} numberOfLines={1}>{name}</Text><Text style={s.text} numberOfLines={1}>{item.text_content || (item.media_type === 'video' ? 'Shared a video' : item.media_type === 'image' ? 'Shared a photo' : 'Shared a moment')}</Text><Text style={s.sub}>{new Date(item.created_at).toLocaleString()}</Text></View>
      <Text style={s.open}>View ›</Text>
    </TouchableOpacity>;
  };

  return <View style={s.container}>
    <View style={s.header}><View><Text style={s.title}>Status</Text><Text style={s.sub}>Photos, videos and updates that expire after 24 hours</Text></View><TouchableOpacity style={s.add} onPress={() => navigation.navigate('CreateStatus')}><Text style={s.addText}>＋</Text></TouchableOpacity></View>
    <TouchableOpacity style={s.my} onPress={() => navigation.navigate('CreateStatus')}><View style={s.myAvatar}><Text style={s.myPlus}>＋</Text></View><View style={{ flex: 1 }}><Text style={s.name}>Add to your status</Text><Text style={s.sub}>{myRows.length ? `${myRows.length} active update${myRows.length === 1 ? '' : 's'} · Tap to add another` : 'Share a photo, video or text update'}</Text></View><Text style={s.open}>Create ›</Text></TouchableOpacity>
    {myRows.length > 0 && <><Text style={s.section}>Your updates</Text><FlatList data={myRows} keyExtractor={x => x.id} renderItem={renderStatus} scrollEnabled={false}/></>}
    <Text style={s.section}>Recent updates</Text>
    {busy ? <ActivityIndicator color="#168BFF" style={{ marginTop: 30 }}/> : <FlatList data={otherRows} keyExtractor={x => x.id} renderItem={renderStatus} onRefresh={load} refreshing={busy} ListEmptyComponent={<Text style={s.empty}>No active updates from other members yet. Share the first one or check back later.</Text>}/>}
    {!!notice && <Text style={s.error}>{notice}</Text>}
  </View>;
}
const s = StyleSheet.create({
 container:{flex:1,minHeight:0,backgroundColor:'#07111F',padding:18},header:{marginTop:18,marginBottom:18,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},title:{color:'#FFF',fontSize:28,fontWeight:'bold'},sub:{color:'#8293A8',fontSize:11,marginTop:4},add:{width:44,height:44,borderRadius:22,backgroundColor:'#168BFF',alignItems:'center',justifyContent:'center'},addText:{color:'#FFF',fontSize:28},my:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:14,borderBottomWidth:1,borderColor:'#263A53',marginBottom:15},myAvatar:{width:48,height:48,borderRadius:24,backgroundColor:'#1C3655',alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'#168BFF'},myPlus:{color:'#FFF',fontSize:26},section:{color:'#DDEBFA',fontSize:14,fontWeight:'bold',marginTop:12,marginBottom:5},item:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12,borderBottomWidth:1,borderColor:'#263A53'},avatarWrap:{width:52,height:52,borderRadius:26,borderWidth:2,borderColor:'#168BFF',padding:2},avatar:{flex:1,borderRadius:24,backgroundColor:'#1C3655',alignItems:'center',justifyContent:'center'},avatarText:{color:'#FFF',fontWeight:'bold',fontSize:18},pic:{width:44,height:44,borderRadius:22},name:{color:'#FFF',fontWeight:'bold'},text:{color:'#C2D1E1',marginTop:4,fontSize:12},open:{color:'#68BAFF',fontSize:11,fontWeight:'bold'},empty:{color:'#9AABC0',textAlign:'center',marginTop:45,lineHeight:22,paddingHorizontal:12},error:{color:'#FF8795',marginTop:12}
});
