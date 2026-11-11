import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { createDirectConversation } from '../services/social';

export default function NewChatScreen({ navigation }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [openingId, setOpeningId] = useState('');
  const [notice, setNotice] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Older accounts may pre-date the profile trigger. Ensure the signed-in
  // account has a public profile row without changing an existing profile.
  const ensureMyProfile = useCallback(async () => {
    if (!user?.id) throw new Error('Please sign in again to discover people.');
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const metadata = user.user_metadata || {};
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: metadata.full_name || metadata.name || '',
        username: metadata.username || null
      });
      if (insertError && insertError.code !== '23505') throw insertError;
    }
  }, [user]);

  const loadPeople = useCallback(async () => {
    if (!user?.id) return;
    setBusy(true);
    setNotice('');
    try {
      await ensureMyProfile();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .order('full_name', { ascending: true })
        .limit(100);
      if (error) throw error;
      setResults(data || []);
      setHasSearched(false);
      if (!(data || []).length) {
        setNotice('No other member profiles are visible yet. Ask the other member to sign in once, save their profile, then refresh.');
      }
    } catch (error) {
      setNotice(`Could not load member accounts: ${error.message || 'Please try again.'}`);
      setResults([]);
    } finally {
      setBusy(false);
    }
  }, [user?.id, ensureMyProfile]);

  useEffect(() => { loadPeople(); }, [loadPeople]);

  const search = async () => {
    const q = query.trim().replace(/^@/, '');
    if (q.length < 2) {
      setNotice('Enter at least 2 characters of a display name or username.');
      return;
    }
    if (!user?.id) return;
    setBusy(true);
    setNotice('');
    setHasSearched(true);
    try {
      await ensureMyProfile();
      const [byUsername, byName] = await Promise.all([
        supabase.from('profiles').select('id, username, full_name, avatar_url').ilike('username', `%${q}%`).neq('id', user.id).limit(50),
        supabase.from('profiles').select('id, username, full_name, avatar_url').ilike('full_name', `%${q}%`).neq('id', user.id).limit(50)
      ]);
      if (byUsername.error) throw byUsername.error;
      if (byName.error) throw byName.error;
      const combined = [...(byUsername.data || []), ...(byName.data || [])];
      const unique = Array.from(new Map(combined.map(person => [person.id, person])).values());
      setResults(unique);
      if (!unique.length) setNotice('No matching member found. Check the spelling or ask them to save a display name in Profile.');
    } catch (error) {
      setResults([]);
      setNotice(`Account search failed: ${error.message || 'Please try again.'}`);
    } finally {
      setBusy(false);
    }
  };

  const open = async person => {
    try {
      setOpeningId(person.id);
      setNotice('');
      const id = await createDirectConversation(user.id, person.id);
      navigation.replace('ChatConversation', {
        chatId: id,
        chatName: person.full_name || (person.username ? `@${person.username}` : 'KONNEKT member')
      });
    } catch (error) {
      setNotice(`Could not start this conversation: ${error.message || 'Please try again.'}`);
    } finally {
      setOpeningId('');
    }
  };

  const clearSearch = () => { setQuery(''); loadPeople(); };

  return (
    <View style={s.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button"><Text style={s.back}>‹ Back to Chats</Text></TouchableOpacity>
      <Text style={s.title}>Discover accounts</Text>
      <Text style={s.hint}>Find registered KONNEKT members by display name or username. Email addresses are never shown.</Text>
      <View style={s.searchRow}>
        <TextInput style={s.input} value={query} onChangeText={setQuery} onSubmitEditing={search}
          placeholder="Search name or @username" placeholderTextColor="#BBA9CC" autoCapitalize="none" returnKeyType="search" />
        <TouchableOpacity style={s.button} onPress={search} disabled={busy}><Text style={s.buttonText}>Search</Text></TouchableOpacity>
      </View>
      <View style={s.listHeading}>
        <Text style={s.listTitle}>{hasSearched ? 'Search results' : 'KONNEKT members'}</Text>
        <TouchableOpacity onPress={clearSearch} disabled={busy}><Text style={s.refresh}>Refresh</Text></TouchableOpacity>
      </View>
      {busy ? <ActivityIndicator color="#6A0DAD" style={{ marginTop: 28 }} /> : (
        <FlatList data={results} keyExtractor={person => person.id} onRefresh={loadPeople} refreshing={busy}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.person} onPress={() => open(item)} disabled={!!openingId}>
              <View style={s.avatar}><Text style={s.avatarText}>{(item.full_name || item.username || 'K').trim().charAt(0).toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.full_name || 'KONNEKT member'}</Text>
                <Text style={s.username}>{item.username ? `@${item.username}` : 'Username not set'}</Text>
              </View>
              {openingId === item.id ? <ActivityIndicator color="#6A0DAD" /> : <Text style={s.arrow}>Message ›</Text>}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={s.empty}>No other accounts to show yet. Pull down to refresh after another member has registered and saved a profile.</Text>}
        />
      )}
      {!!notice && <Text style={s.notice}>{notice}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#10091B',padding:20}, back:{color:'#6A0DAD',fontSize:16,marginTop:20},
  title:{color:'#FFF',fontSize:27,fontWeight:'bold',marginTop:22}, hint:{color:'#C4B4D0',marginTop:8,marginBottom:20,lineHeight:20},
  searchRow:{flexDirection:'row',gap:8}, input:{flex:1,backgroundColor:'#241630',borderRadius:10,padding:13,color:'#FFF',borderWidth:1,borderColor:'#39244B'},
  button:{backgroundColor:'#6A0DAD',borderRadius:10,paddingHorizontal:16,justifyContent:'center'},buttonText:{color:'#FFF',fontWeight:'bold'},
  listHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:25,marginBottom:8},listTitle:{color:'#EAF4FF',fontWeight:'bold',fontSize:16},
  refresh:{color:'#C9A7F4',fontSize:13},person:{flexDirection:'row',alignItems:'center',paddingVertical:14,borderBottomWidth:1,borderColor:'#39244B',gap:12},
  avatar:{width:44,height:44,borderRadius:22,backgroundColor:'#30203F',alignItems:'center',justifyContent:'center'},avatarText:{color:'#FFF',fontSize:19,fontWeight:'bold'},
  name:{color:'#FFF',fontWeight:'bold'},username:{color:'#8EA3BB',marginTop:4,fontSize:12},arrow:{color:'#C9A7F4',fontWeight:'bold',fontSize:12},
  empty:{color:'#C4B4D0',textAlign:'center',marginTop:35,lineHeight:22},notice:{color:'#FFC0C8',marginTop:16,lineHeight:20}
});
