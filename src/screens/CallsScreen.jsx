import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { createCall } from '../services/calls';

export default function CallsScreen({ navigation }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(true);
  const [starting, setStarting] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) { setBusy(false); return; }
    setBusy(true); setNotice('');
    try {
      const { data: calls, error } = await supabase.from('call_sessions').select('*')
        .or(`caller_id.eq.${user.id},callee_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(40);
      if (error) throw error;
      const rows = calls || [];
      const ids = [...new Set(rows.map(row => row.caller_id === user.id ? row.callee_id : row.caller_id).filter(Boolean))];
      const { data: profiles, error: profileError } = ids.length
        ? await supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', ids)
        : { data: [], error: null };
      if (profileError) throw profileError;
      const map = Object.fromEntries((profiles || []).map(profile => [profile.id, profile]));
      setHistory(rows.map(row => ({ ...row, contact: map[row.caller_id === user.id ? row.callee_id : row.caller_id] || {} })));
      const { data: members, error: membersError } = await supabase.from('profiles').select('id,username,full_name,avatar_url').neq('id', user.id).order('full_name').limit(60);
      if (membersError) throw membersError;
      setPeople(members || []);
    } catch (error) { setNotice(error.message || 'Could not load call history.'); }
    finally { setBusy(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const start = async (person, callType) => {
    setStarting(`${person.id}-${callType}`); setNotice('');
    try {
      const call = await createCall({ calleeId: person.id, callType });
      navigation.navigate('Call', { callId: call.id, callType, contact: { ...person, name: person.full_name || person.username || 'KONNEKT member' } });
    } catch (error) { setNotice(error.message || 'Could not start this call.'); }
    finally { setStarting(''); }
  };

  const filtered = people.filter(person => `${person.full_name || ''} ${person.username || ''}`.toLowerCase().includes(query.toLowerCase()));
  const statusLabel = row => row.status === 'accepted' ? 'Connected' : row.status === 'missed' ? 'Missed' : row.status === 'declined' ? 'Declined' : row.status === 'ended' ? 'Ended' : row.status || 'Pending';
  const personName = person => person.full_name || (person.username ? `@${person.username}` : 'KONNEKT member');

  return <View style={s.page}>
    <View style={s.header}><View><Text style={s.title}>Calls</Text><Text style={s.subtitle}>Voice and video conversations</Text></View><TouchableOpacity style={s.refresh} onPress={load}><Text style={s.refreshText}>↻ Refresh</Text></TouchableOpacity></View>
    {!!notice && <Text style={s.notice}>{notice}</Text>}
    <Text style={s.section}>Recent calls</Text>
    {busy ? <ActivityIndicator color="#FFC107" style={{ marginTop: 22 }} /> : <FlatList data={history} keyExtractor={item => item.id} style={{ maxHeight: 250, flexGrow: 0 }} renderItem={({ item }) => <View style={s.callRow}><View style={s.avatar}><Text style={s.avatarText}>{personName(item.contact).slice(0,1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={s.name}>{personName(item.contact)}</Text><Text style={s.meta}>{item.call_type === 'video' ? 'Video' : 'Voice'} · {statusLabel(item)} · {new Date(item.created_at).toLocaleString()}</Text></View><Text style={s.callIcon}>{item.caller_id === user?.id ? '↗' : '↙'}</Text></View>} ListEmptyComponent={<Text style={s.empty}>Your call history will appear here after your first call.</Text>} />}
    <Text style={s.section}>Start a call</Text>
    <TextInput value={query} onChangeText={setQuery} style={s.search} placeholder="Find a KONNEKT member" placeholderTextColor="#A996B7" />
    <FlatList data={filtered} keyExtractor={item => item.id} renderItem={({ item }) => <View style={s.personRow}><View style={s.avatar}><Text style={s.avatarText}>{personName(item).slice(0,1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={s.name}>{personName(item)}</Text><Text style={s.meta}>{item.username ? `@${item.username}` : 'KONNEKT member'}</Text></View><TouchableOpacity disabled={!!starting} style={s.voiceButton} onPress={() => start(item, 'voice')}><Text style={s.buttonText}>{starting === `${item.id}-voice` ? '…' : '☎'}</Text></TouchableOpacity><TouchableOpacity disabled={!!starting} style={s.videoButton} onPress={() => start(item, 'video')}><Text style={s.buttonText}>{starting === `${item.id}-video` ? '…' : '▣'}</Text></TouchableOpacity></View>} ListEmptyComponent={<Text style={s.empty}>{query ? 'No members match your search.' : 'No other members are available yet.'}</Text>} />
  </View>;
}
const s = StyleSheet.create({
 page:{flex:1,minHeight:0,backgroundColor:'#10091B',padding:18},header:{marginTop:12,marginBottom:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},title:{color:'#FFF',fontSize:28,fontWeight:'900'},subtitle:{color:'#BBA9CC',fontSize:12,marginTop:4},refresh:{backgroundColor:'#30203F',padding:10,borderRadius:12},refreshText:{color:'#FFC107',fontWeight:'800',fontSize:12},section:{color:'#FFC107',fontSize:14,fontWeight:'900',marginTop:15,marginBottom:10,letterSpacing:.5},callRow:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:12,borderBottomWidth:1,borderColor:'#39244B'},personRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:11,borderBottomWidth:1,borderColor:'#39244B'},avatar:{width:42,height:42,borderRadius:21,backgroundColor:'#3A0CA3',alignItems:'center',justifyContent:'center'},avatarText:{color:'#FFF',fontWeight:'900',fontSize:17},name:{color:'#FFF',fontWeight:'800',fontSize:14},meta:{color:'#BBA9CC',fontSize:10,marginTop:4},callIcon:{color:'#FFC107',fontSize:20},search:{backgroundColor:'#241630',borderWidth:1,borderColor:'#503567',borderRadius:13,padding:13,color:'#FFF',marginBottom:7},voiceButton:{backgroundColor:'#6A0DAD',borderRadius:18,width:36,height:36,alignItems:'center',justifyContent:'center'},videoButton:{backgroundColor:'#FF6B00',borderRadius:18,width:36,height:36,alignItems:'center',justifyContent:'center'},buttonText:{color:'#FFF',fontWeight:'900'},empty:{color:'#BBA9CC',textAlign:'center',padding:18,lineHeight:21},notice:{color:'#FFB6C0',marginBottom:8,lineHeight:19}
});
