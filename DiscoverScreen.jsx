import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { createDirectConversation } from '../services/social';

const columns = 'id,username,full_name,avatar_url,bio';
export default function DiscoverScreen({ navigation }) {
  const { user } = useAuth();
  const [people, setPeople] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(true);
  const [actionId, setActionId] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) { setBusy(false); return; }
    setBusy(true); setNotice('');
    try {
      const [profilesResult, followsResult] = await Promise.all([
        supabase.from('profiles').select(columns).neq('id', user.id).order('full_name', { ascending: true }).limit(200),
        supabase.from('follows').select('followed_id').eq('follower_id', user.id)
      ]);
      if (profilesResult.error) throw profilesResult.error;
      if (followsResult.error) throw followsResult.error;
      setPeople(profilesResult.data || []);
      setFollowing(new Set((followsResult.data || []).map(row => row.followed_id)));
    } catch (error) { setNotice(`Could not load Discover: ${error.message || 'Please try again.'}`); }
    finally { setBusy(false); }
  }, [user?.id]);

  useEffect(() => {
    load();
    const channel = supabase.channel(`discover-${user?.id || 'guest'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, user?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().replace(/^@/, '').toLowerCase();
    if (!q) return people;
    return people.filter(p => `${p.username || ''} ${p.full_name || ''} ${p.bio || ''}`.toLowerCase().includes(q));
  }, [people, query]);

  const toggleFollow = async person => {
    if (!user?.id || !person?.id || actionId) return;
    setActionId(person.id); setNotice('');
    const isFollowing = following.has(person.id);
    try {
      const result = isFollowing
        ? await supabase.from('follows').delete().eq('follower_id', user.id).eq('followed_id', person.id)
        : await supabase.from('follows').insert({ follower_id: user.id, followed_id: person.id });
      if (result.error) throw result.error;
      setFollowing(prev => { const next = new Set(prev); isFollowing ? next.delete(person.id) : next.add(person.id); return next; });
    } catch (error) { setNotice(`Follow update failed: ${error.message || 'Please try again.'}`); }
    finally { setActionId(''); }
  };

  const openProfile = person => navigation.navigate('ContactProfile', { contact: {
    id: person.id, name: person.full_name || person.username || 'KONNEKT member',
    username: person.username ? `@${person.username}` : '@member',
    avatar_url: person.avatar_url, bio: person.bio || '', initials: (person.full_name || person.username || 'K').slice(0, 1).toUpperCase(), onKonnekt: true
  }});

  const message = async person => {
    setActionId(person.id); setNotice('');
    try {
      const chatId = await createDirectConversation(user.id, person.id);
      navigation.navigate('ChatConversation', { chatId, chatName: person.full_name || (person.username ? `@${person.username}` : 'KONNEKT member') });
    } catch (error) { setNotice(`Could not open chat: ${error.message || 'Please try again.'}`); }
    finally { setActionId(''); }
  };

  const renderPerson = ({ item }) => {
    const isFollowing = following.has(item.id);
    return <View style={s.person}>
      <TouchableOpacity style={s.identity} onPress={() => openProfile(item)}>
        {item.avatar_url ? <Image source={{ uri: item.avatar_url }} style={s.avatarImage}/> : <View style={s.avatar}><Text style={s.avatarText}>{(item.full_name || item.username || 'K').slice(0,1).toUpperCase()}</Text></View>}
        <View style={{ flex: 1, minWidth: 0 }}><Text style={s.name} numberOfLines={1}>{item.full_name || 'KONNEKT member'}</Text><Text style={s.username}>{item.username ? `@${item.username}` : 'Username not set'}</Text>{!!item.bio && <Text style={s.bio} numberOfLines={1}>{item.bio}</Text>}</View>
      </TouchableOpacity>
      <View style={s.actions}>
        <TouchableOpacity style={[s.follow, isFollowing && s.following]} disabled={!!actionId} onPress={() => toggleFollow(item)}><Text style={s.followText}>{actionId === item.id ? '…' : isFollowing ? 'Following' : '+ Follow'}</Text></TouchableOpacity>
        <TouchableOpacity style={s.message} disabled={!!actionId} onPress={() => message(item)}><Text style={s.messageText}>Message</Text></TouchableOpacity>
      </View>
    </View>;
  };

  return <View style={s.container}>
    <View style={s.header}><View><Text style={s.title}>Discover</Text><Text style={s.subtitle}>Find people and creators on KONNEKT</Text></View><TouchableOpacity onPress={load} style={s.refresh}><Text style={s.refreshText}>↻ Refresh</Text></TouchableOpacity></View>
    <TextInput style={s.search} value={query} onChangeText={setQuery} placeholder="Search people by name or @username" placeholderTextColor="#8293A8" autoCapitalize="none" returnKeyType="search"/>
    <Text style={s.section}>{query.trim() ? `${filtered.length} matching accounts` : 'KONNEKT community'}</Text>
    {busy ? <ActivityIndicator color="#168BFF" style={{ marginTop: 35 }}/> : <FlatList data={filtered} keyExtractor={p => p.id} renderItem={renderPerson} onRefresh={load} refreshing={busy} keyboardShouldPersistTaps="handled" ListEmptyComponent={<Text style={s.empty}>{query.trim() ? 'No accounts match your search.' : 'No other accounts are available yet. Ask another member to sign in and save their profile.'}</Text>}/>}
    {!!notice && <Text style={s.notice}>{notice}</Text>}
  </View>;
}
const s = StyleSheet.create({
 container:{flex:1,minHeight:0,backgroundColor:'#07111F',padding:18},header:{marginTop:18,marginBottom:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},title:{color:'#FFF',fontSize:28,fontWeight:'bold'},subtitle:{color:'#8293A8',fontSize:11,marginTop:4},refresh:{padding:9,backgroundColor:'#14243A',borderRadius:9},refreshText:{color:'#8CCBFF',fontWeight:'bold',fontSize:12},search:{backgroundColor:'#14243A',borderColor:'#263A53',borderWidth:1,borderRadius:12,padding:14,color:'#FFF',marginBottom:18},section:{color:'#DDEBFA',fontSize:15,fontWeight:'bold',marginBottom:8},person:{paddingVertical:12,borderBottomWidth:1,borderColor:'#263A53'},identity:{flexDirection:'row',alignItems:'center',gap:11},avatar:{width:48,height:48,borderRadius:24,backgroundColor:'#193B5C',alignItems:'center',justifyContent:'center'},avatarImage:{width:48,height:48,borderRadius:24},avatarText:{color:'#FFF',fontSize:18,fontWeight:'bold'},name:{color:'#FFF',fontWeight:'bold'},username:{color:'#8CCBFF',fontSize:12,marginTop:3},bio:{color:'#8293A8',fontSize:11,marginTop:3},actions:{flexDirection:'row',gap:8,marginLeft:59,marginTop:9},follow:{backgroundColor:'#168BFF',paddingVertical:8,paddingHorizontal:13,borderRadius:18},following:{backgroundColor:'#263A53',borderWidth:1,borderColor:'#54708E'},followText:{color:'#FFF',fontSize:11,fontWeight:'bold'},message:{borderWidth:1,borderColor:'#168BFF',paddingVertical:7,paddingHorizontal:13,borderRadius:18},messageText:{color:'#8CCBFF',fontSize:11,fontWeight:'bold'},empty:{color:'#9AABC0',textAlign:'center',marginTop:45,lineHeight:22},notice:{color:'#FFB6C0',marginTop:12,lineHeight:19}
});
