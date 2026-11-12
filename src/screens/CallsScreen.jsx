import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { createCall } from '../services/calls';

const profileColumns = 'id,username,full_name,avatar_url';

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
    setBusy(true);
    setNotice('');

    try {
      const { data: calls, error } = await supabase.from('call_sessions').select('id,caller_id,callee_id,call_type,status,created_at,ended_at')
        .or(`caller_id.eq.${user.id},callee_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(40);

      if (error) throw error;

      const rows = calls || [];
      const ids = [...new Set(rows.map(row => row.caller_id === user.id ? row.callee_id : row.caller_id).filter(Boolean))];
      const [profileResult, peopleResult] = await Promise.all([
        ids.length ? supabase.from('profiles').select(profileColumns).in('id', ids) : Promise.resolve({ data: [], error: null }),
        supabase.from('profiles').select(profileColumns).neq('id', user.id).order('full_name', { ascending: true }).limit(100)
      ]);

      if (profileResult.error) throw profileResult.error;
      if (peopleResult.error) throw peopleResult.error;

      const profiles = Object.fromEntries((profileResult.data || []).map(profile => [profile.id, profile]));
      setHistory(rows.map(row => ({ ...row, contact: profiles[row.caller_id === user.id ? row.callee_id : row.caller_id] || {} })));
      setPeople(peopleResult.data || []);
    } catch (error) {
      setNotice(error?.message || 'Could not load call history. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const start = async (person, callType) => {
    if (starting || !person?.id) return;
    setStarting(`${person.id}-${callType}`);
    setNotice('');
    try {
      const call = await createCall({ calleeId: person.id, callType });
      navigation.navigate('Call', {
        callId: call.id,
        callType,
        contact: { ...person, name: person.full_name || person.username || 'KONNEKT member' }
      });
    } catch (error) {
      setNotice(error?.message || 'Could not start this call. Check your connection and call permissions.');
    } finally {
      setStarting('');
      load();
    }
  };

  const filteredPeople = useMemo(() => {
    const term = query.trim().replace(/^@/, '').toLowerCase();
    if (!term) return people.slice(0, 12);
    return people.filter(person => `${person.full_name || ''} ${person.username || ''}`.toLowerCase().includes(term)).slice(0, 30);
  }, [people, query]);

  const personName = person => person.full_name || (person.username ? `@${person.username}` : 'KONNEKT member');
  const statusLabel = status => ({ accepted: 'Connected', ringing: 'Calling', missed: 'Missed', declined: 'Declined', ended: 'Ended' }[status] || 'Call');
  const callAgain = row => start(row.contact, row.call_type === 'video' ? 'video' : 'voice');

  const renderHistory = ({ item }) => {
    const incoming = item.callee_id === user?.id;
    const date = item.created_at ? new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '';
    return (
      <View style={s.historyRow}>
        <View style={[s.callIcon, item.status === 'missed' && s.missedIcon]}><Text style={s.callGlyph}>{item.call_type === 'video' ? '▣' : '☎'}</Text></View>
        <View style={s.historyCopy}>
          <Text style={s.personName} numberOfLines={1}>{personName(item.contact)}</Text>
          <Text style={s.meta}>{incoming ? 'Incoming' : 'Outgoing'} · {statusLabel(item.status)} · {date}</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Call ${personName(item.contact)} again`} style={s.redial} disabled={!!starting || !item.contact.id} onPress={() => callAgain(item)}>
          <Text style={s.redialText}>↻</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPerson = ({ item }) => (
    <View style={s.personRow}>
      {item.avatar_url ? <Image source={{ uri: item.avatar_url }} style={s.avatarImage} /> : <View style={s.avatar}><Text style={s.avatarText}>{personName(item).slice(0, 1).toUpperCase()}</Text></View>}
      <View style={s.personCopy}><Text style={s.personName} numberOfLines={1}>{personName(item)}</Text><Text style={s.meta}>{item.username ? `@${item.username}` : 'KONNEKT member'}</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Start voice call with ${personName(item)}`} style={s.voiceButton} disabled={!!starting} onPress={() => start(item, 'voice')}>
        <Text style={s.actionText}>{starting === `${item.id}-voice` ? '…' : '☎'}</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Start video call with ${personName(item)}`} style={s.videoButton} disabled={!!starting} onPress={() => start(item, 'video')}>
        <Text style={s.actionText}>{starting === `${item.id}-video` ? '…' : '▣'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.page}>
      <View style={s.header}>
        <View><Text style={s.title}>Calls</Text><Text style={s.subtitle}>Voice and video conversations</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Refresh calls" style={s.refresh} onPress={load}>
          <Text style={s.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>
      {!!notice && <Text accessibilityRole="alert" style={s.notice}>{notice}</Text>}
      <Text style={s.section}>Recent calls</Text>
      {busy && !history.length ? <ActivityIndicator color="#FFC107" style={s.loading} /> : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderHistory}
          style={s.historyList}
          onRefresh={load}
          refreshing={busy}
          ListEmptyComponent={<Text style={s.empty}>Your call history will appear here after you connect with someone.</Text>}
        />
      )}
      <Text style={s.section}>Start a call</Text>
      <TextInput value={query} onChangeText={setQuery} style={s.search} placeholder="Search people by name or username" placeholderTextColor="#C4B4D0" accessibilityLabel="Search people to call" autoCapitalize="none" returnKeyType="search" />
      <FlatList
        data={filteredPeople}
        keyExtractor={item => item.id}
        renderItem={renderPerson}
        style={s.peopleList}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={s.empty}>{query.trim() ? 'No matching people found.' : 'No other KONNEKT members are available yet.'}</Text>}
      />
      <Text style={s.footnote}>Calls need microphone access; video calls also need camera access. Reliable connections may require TURN configuration.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, minHeight: 0, backgroundColor: '#10091B', paddingHorizontal: 18, paddingTop: 10 },
  header: { marginTop: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#C4B4D0', marginTop: 4, fontSize: 12 },
  refresh: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#241630', borderWidth: 1, borderColor: '#39244B' },
  refreshText: { color: '#00E6FF', fontSize: 24 },
  section: { color: '#FFC107', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginTop: 8, marginBottom: 7, textTransform: 'uppercase' },
  historyList: { maxHeight: 245, flexGrow: 0 },
  peopleList: { flex: 1, minHeight: 80 },
  loading: { marginVertical: 22 },
  historyRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#39244B', gap: 10 },
  callIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#241630', alignItems: 'center', justifyContent: 'center' },
  missedIcon: { backgroundColor: 'rgba(255,107,0,.18)' },
  callGlyph: { color: '#00E6FF', fontSize: 17 },
  historyCopy: { flex: 1, minWidth: 0 },
  personName: { color: '#FAF8FF', fontSize: 14, fontWeight: '700' },
  meta: { color: '#C4B4D0', fontSize: 10, marginTop: 4 },
  redial: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3A0CA3' },
  redialText: { color: '#FFF', fontSize: 20 },
  search: { backgroundColor: '#241630', color: '#FAF8FF', borderColor: '#39244B', borderWidth: 1, borderRadius: 12, padding: 13, marginBottom: 7 },
  personRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#39244B', gap: 9 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#3A0CA3', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#241630' },
  avatarText: { color: '#FFF', fontWeight: '800' },
  personCopy: { flex: 1, minWidth: 0 },
  voiceButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6A0DAD', alignItems: 'center', justifyContent: 'center' },
  videoButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  empty: { color: '#C4B4D0', textAlign: 'center', padding: 16, fontSize: 12, lineHeight: 18 },
  notice: { color: '#FFD0B5', backgroundColor: 'rgba(255,107,0,.12)', padding: 10, borderRadius: 9, marginBottom: 8 },
  footnote: { color: '#A998B8', fontSize: 10, lineHeight: 15, textAlign: 'center', paddingVertical: 7 }
});

























































