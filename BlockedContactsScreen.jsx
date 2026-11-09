import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getKonnektBlockedUsers, unblockKonnektUser } from '../services/safety';

export default function BlockedContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setBusy(true); setNotice('');
    try { setContacts(await getKonnektBlockedUsers()); }
    catch (error) { setNotice(error.message || 'Could not load blocked accounts.'); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const unblock = person => Alert.alert('Unblock account?', `Allow ${person.full_name || person.username || 'this member'} to contact you again?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Unblock', onPress: async () => { try { await unblockKonnektUser(person.blocked_id); await load(); } catch (error) { setNotice(error.message); } } }
  ]);
  const filtered = contacts.filter(person => `${person.full_name || ''} ${person.username || ''}`.toLowerCase().includes(search.toLowerCase()));
  return <View style={s.container}>
    <View style={s.header}><TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>‹</Text></TouchableOpacity><Text style={s.title}>Blocked accounts</Text><TouchableOpacity onPress={load}><Text style={s.refresh}>↻</Text></TouchableOpacity></View>
    <Text style={s.info}>People you block cannot start direct conversations with you. They are not notified when you block them.</Text>
    <TextInput style={s.search} value={search} onChangeText={setSearch} placeholder="Search blocked accounts" placeholderTextColor="#8293A8"/>
    {busy ? <ActivityIndicator color="#168BFF" style={{ marginTop: 30 }}/> : <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      {filtered.map(person => <View key={person.blocked_id} style={s.row}><View style={s.avatar}><Text style={s.avatarText}>{(person.full_name || person.username || 'K').slice(0,1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={s.name}>{person.full_name || 'KONNEKT member'}</Text><Text style={s.username}>{person.username ? `@${person.username}` : 'Member'}</Text></View><TouchableOpacity style={s.unblock} onPress={() => unblock(person)}><Text style={s.unblockText}>Unblock</Text></TouchableOpacity></View>)}
      {!filtered.length && <Text style={s.empty}>No blocked accounts found.</Text>}
    </ScrollView>}
    {!!notice && <Text style={s.notice}>{notice}</Text>}
  </View>;
}
const s=StyleSheet.create({container:{flex:1,backgroundColor:'#07111F',padding:18},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:20,marginBottom:18},back:{color:'#168BFF',fontSize:32},title:{color:'#FFF',fontSize:21,fontWeight:'bold'},refresh:{color:'#8CCBFF',fontSize:24},info:{color:'#9EB0C4',lineHeight:20,marginBottom:16},search:{backgroundColor:'#14243A',borderColor:'#263A53',borderWidth:1,borderRadius:11,padding:13,color:'#FFF',marginBottom:12},row:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:13,borderBottomWidth:1,borderColor:'#263A53'},avatar:{width:42,height:42,borderRadius:21,backgroundColor:'#1C3B5A',alignItems:'center',justifyContent:'center'},avatarText:{color:'#FFF',fontWeight:'bold',fontSize:18},name:{color:'#FFF',fontWeight:'bold'},username:{color:'#8CCBFF',fontSize:11,marginTop:3},unblock:{borderWidth:1,borderColor:'#168BFF',paddingVertical:8,paddingHorizontal:12,borderRadius:18},unblockText:{color:'#8CCBFF',fontWeight:'bold',fontSize:11},empty:{color:'#8293A8',textAlign:'center',marginTop:45},notice:{color:'#FF9CA8',marginTop:12}});
