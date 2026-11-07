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

  const loadPeople = useCallback(async () => {
    if (!user?.id) return;
    setBusy(true);
    setNotice('');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .neq('id', user.id)
      .order('full_name', { ascending: true })
      .limit(50);
    setBusy(false);
    if (error) {
      setNotice(`Could not load accounts: ${error.message}`);
      return;
    }
    setResults(data || []);
  }, [user?.id]);

  useEffect(() => { loadPeople(); }, [loadPeople]);

  const search = async () => {
    const q = query.trim().replace(/^@/, '');
    if (q.length < 2) {
      setNotice('Type at least 2 letters of a name or username.');
      return;
    }
    if (!user?.id) return;
    setBusy(true);
    setNotice('');
    setHasSearched(true);

    // Search both fields separately. This also finds people who have saved
    // a display name but have not chosen a username yet.
    const [byUsername, byName] = await Promise.all([
      supabase.from('profiles').select('id, username, full_name, avatar_url').ilike('username', `%${q}%`).neq('id', user.id).limit(30),
      supabase.from('profiles').select('id, username, full_name, avatar_url').ilike('full_name', `%${q}%`).neq('id', user.id).limit(30)
    ]);
    setBusy(false);
    if (byUsername.error || byName.error) {
      setNotice(`Account search failed: ${(byUsername.error || byName.error).message}`);
      return;
    }
    const combined = [...(byUsername.data || []), ...(byName.data || [])];
    const unique = Array.from(new Map(combined.map(person => [person.id, person])).values());
    setResults(unique);
    if (!unique.length) setNotice('No matching accounts found. Ask the person to save a profile name in Profile, then try again.');
  };

  const open = async person => {
    try {
      setOpeningId(person.id);
      setNotice('');
      const id = await createDirectConversation(user.id, person.id);
      navigation.replace('ChatConversation', {
        chatId: id,
        chatName: person.full_name || person.username || 'KONNEKT user'
      });
    } catch (e) {
      setNotice(e.message || 'Could not start this conversation.');
    } finally {
      setOpeningId('');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setHasSearched(false);
    loadPeople();
  };

  return (
    <View style={s.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
        <Text style={s.back}>‹ Back to Chats</Text>
      </TouchableOpacity>
      <Text style={s.title}>Discover accounts</Text>
      <Text style={s.hint}>Find people on KONNEKT using their display name or username. You do not need to know their email address.</Text>

      <View style={s.searchRow}>
        <TextInput
          style={s.input}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          placeholder="Search name or @username"
          placeholderTextColor="#8293A8"
          autoCapitalize="none"
          returnKeyType="search"
        />
        <TouchableOpacity style={s.button} onPress={search} disabled={busy}>
          <Text style={s.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={s.listHeading}>
        <Text style={s.listTitle}>{hasSearched ? 'Search results' : 'People on KONNEKT'}</Text>
        <TouchableOpacity onPress={clearSearch}><Text style={s.refresh}>Show all</Text></TouchableOpacity>
      </View>

      {busy ? (
        <ActivityIndicator color="#168BFF" style={{ marginTop: 28 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={person => person.id}
          onRefresh={loadPeople}
          refreshing={busy}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.person} onPress={() => open(item)} disabled={!!openingId}>
              <View style={s.avatar}><Text style={s.avatarText}>👤</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.full_name || 'KONNEKT member'}</Text>
                <Text style={s.username}>{item.username ? `@${item.username}` : 'Username not set'}</Text>
              </View>
              {openingId === item.id ? <ActivityIndicator color="#168BFF" /> : <Text style={s.arrow}>Message ›</Text>}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={s.empty}>No other accounts are visible yet. Ask your friend to log in and save a profile name, then refresh this list.</Text>}
        />
      )}
      {!!notice && <Text style={s.notice}>{notice}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20 },
  back: { color: '#168BFF', fontSize: 16, marginTop: 20 },
  title: { color: '#FFF', fontSize: 27, fontWeight: 'bold', marginTop: 22 },
  hint: { color: '#9AABC0', marginTop: 8, marginBottom: 20, lineHeight: 20 },
  searchRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#14243A', borderRadius: 10, padding: 13, color: '#FFF', borderWidth: 1, borderColor: '#263A53' },
  button: { backgroundColor: '#168BFF', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  listHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 8 },
  listTitle: { color: '#EAF4FF', fontWeight: 'bold', fontSize: 16 },
  refresh: { color: '#67B8FF', fontSize: 13 },
  person: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#263A53', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#203753', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22 },
  name: { color: '#FFF', fontWeight: 'bold' },
  username: { color: '#8EA3BB', marginTop: 4, fontSize: 12 },
  arrow: { color: '#67B8FF', fontWeight: 'bold', fontSize: 12 },
  empty: { color: '#9AABC0', textAlign: 'center', marginTop: 35, lineHeight: 22 },
  notice: { color: '#FFC0C8', marginTop: 16, lineHeight: 20 }
});
