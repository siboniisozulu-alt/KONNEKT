import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { getConversationList } from '../services/social';

export default function ChatsScreen({ navigation }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setBusy(true);
      const list = await getConversationList(user.id);
      setRows(list);
      setNotice('');
    } catch (e) {
      setNotice(e.message || 'Could not load conversations.');
    } finally {
      setBusy(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`chat-list-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, load]);

  const filtered = rows.filter(x => (x.displayName || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Chats</Text>
          <Text style={s.sub}>Private conversations</Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" style={s.smallAction} onPress={() => navigation.navigate('Notifications')}>
            <Text style={s.smallActionText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="New conversation" style={s.add} onPress={() => navigation.navigate('NewChat')}>
            <Text style={s.addText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity accessibilityRole="button" style={s.discoverButton} onPress={() => navigation.navigate('NewChat')}>
        <Text style={s.discoverIcon}>⌕</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.discoverTitle}>Discover accounts</Text>
          <Text style={s.discoverSub}>Find KONNEKT members by name or username</Text>
        </View>
        <Text style={s.discoverArrow}>›</Text>
      </TouchableOpacity>

      <TextInput
        style={s.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search your conversations"
        placeholderTextColor="#8293A8"
      />

      {busy ? (
        <ActivityIndicator color="#168BFF" style={{ marginTop: 35 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={x => x.id}
          onRefresh={load}
          refreshing={busy}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.item} onPress={() => navigation.navigate('ChatConversation', { chatId: item.id, chatName: item.displayName })}>
              <View style={s.avatar}><Text style={s.avatarText}>{item.is_group ? '👥' : '👤'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.displayName}</Text>
                <Text style={s.last} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              <Text style={s.time}>{new Date(item.lastAt).toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={s.empty}>No conversations yet. Select “Discover accounts” above to find people and start a chat.</Text>}
        />
      )}
      {!!notice && <Text style={s.error}>{notice}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 18 },
  header: { marginTop: 22, marginBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  sub: { color: '#8293A8', marginTop: 4 },
  add: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#168BFF', alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#FFF', fontSize: 30 },
  smallAction: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#203753', alignItems: 'center', justifyContent: 'center' },
  smallActionText: { fontSize: 19 },
  discoverButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#122944', borderWidth: 1, borderColor: '#168BFF', borderRadius: 15, padding: 15, marginBottom: 16, gap: 12 },
  discoverIcon: { color: '#67B8FF', fontSize: 31, width: 32, textAlign: 'center' },
  discoverTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  discoverSub: { color: '#9AABC0', fontSize: 11, marginTop: 4 },
  discoverArrow: { color: '#67B8FF', fontSize: 27 },
  search: { backgroundColor: '#14243A', color: '#FFF', borderRadius: 12, padding: 14, marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#263A53', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#182D49', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 23 },
  name: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  last: { color: '#9AABC0', marginTop: 5 },
  time: { color: '#8293A8', fontSize: 10 },
  empty: { color: '#9AABC0', textAlign: 'center', marginTop: 55, lineHeight: 22, paddingHorizontal: 12 },
  error: { color: '#FF8795', padding: 10 }
});
