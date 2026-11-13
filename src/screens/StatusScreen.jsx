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
    if (!user?.id) {
      setBusy(false);
      return;
    }

    setBusy(true);
    setNotice('');

    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('id,user_id,text_content,media_url,media_type,created_at,expires_at')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ids = [...new Set((data || []).map(row => row.user_id))];
      const { data: profiles, error: profileError } = ids.length
        ? await supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', ids)
        : { data: [], error: null };

      if (profileError) throw profileError;

      const profileMap = Object.fromEntries((profiles || []).map(profile => [profile.id, profile]));
      setRows((data || []).map(row => ({ ...row, profile: profileMap[row.user_id] || {} })));
    } catch (error) {
      setNotice(`Could not load statuses: ${error?.message || 'Please refresh.'}`);
    } finally {
      setBusy(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
    const channel = supabase.channel(`konnekt-status-${user?.id || 'guest'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'statuses' }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [load, user?.id]);

  const myRows = rows.filter(row => row.user_id === user?.id);
  const otherRows = rows.filter(row => row.user_id !== user?.id);

  const renderStatus = ({ item }) => {
    const name = item.profile?.full_name || (item.profile?.username ? `@${item.profile.username}` : 'KONNEKT member');
    return (
      <TouchableOpacity style={s.item} onPress={() => navigation.navigate('StatusViewer', { status: item })} accessibilityRole="button">
        <View style={s.avatarWrap}>
          {item.profile?.avatar_url ? (
            <Image source={{ uri: item.profile.avatar_url }} style={s.pic} />
          ) : (
            <View style={s.avatar}><Text style={s.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.name} numberOfLines={1}>{name}</Text>
          <Text style={s.text} numberOfLines={1}>{item.text_content || (item.media_type === 'video' ? 'Shared a video update' : 'Shared an update')}</Text>
        </View>
        <Text style={s.open}>View ›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Updates</Text>
          <Text style={s.sub}>Photos, videos and text updates that expire after 24 hours</Text>
        </View>
        <TouchableOpacity style={s.add} onPress={() => navigation.navigate('CreateStatus')}>
          <Text style={s.addText}>＋</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.my} onPress={() => navigation.navigate('CreateStatus')}>
        <View style={s.myAvatar}><Text style={s.myPlus}>＋</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.myName}>My status</Text>
          <Text style={s.myMeta}>{myRows.length ? `${myRows.length} active update${myRows.length > 1 ? 's' : ''}` : 'Share your latest update'}</Text>
        </View>
        <Text style={s.open}>New</Text>
      </TouchableOpacity>

      {myRows.length > 0 && <><Text style={s.section}>Your updates</Text><FlatList data={myRows} keyExtractor={x => x.id} renderItem={renderStatus} scrollEnabled={false} /></>}
      <Text style={s.section}>Recent updates</Text>
      {busy ? (
        <ActivityIndicator color="#FFC107" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={otherRows}
          keyExtractor={x => x.id}
          renderItem={renderStatus}
          onRefresh={load}
          refreshing={busy}
          ListEmptyComponent={<Text style={s.empty}>No active status updates yet. Check back soon.</Text>}
        />
      )}
      {!!notice && <Text style={s.error}>{notice}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, minHeight: 0, backgroundColor: '#10091B', padding: 18 },
  header: { marginTop: 18, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#FAF8FF', fontSize: 28, fontWeight: '800' },
  sub: { color: '#C4B4D0', fontSize: 12, marginTop: 4 },
  add: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#FFF', fontSize: 28, fontWeight: '800', marginTop: -2 },
  my: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#170D26', borderWidth: 1, borderColor: '#39244B', borderRadius: 14, padding: 12, marginBottom: 14 },
  myAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#6A0DAD', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  myPlus: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  myName: { color: '#FAF8FF', fontWeight: '700' },
  myMeta: { color: '#C4B4D0', fontSize: 10, marginTop: 3 },
  section: { color: '#FFC107', fontWeight: '800', fontSize: 12, letterSpacing: 1, marginTop: 8, marginBottom: 8, textTransform: 'uppercase' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#39244B' },
  avatarWrap: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#3A0CA3', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800' },
  pic: { width: 42, height: 42, borderRadius: 21 },
  name: { color: '#FAF8FF', fontWeight: '700', fontSize: 14 },
  text: { color: '#C4B4D0', fontSize: 11, marginTop: 4 },
  open: { color: '#00E6FF', fontSize: 12, fontWeight: '700' },
  empty: { color: '#C4B4D0', textAlign: 'center', paddingVertical: 20, fontSize: 12 },
  error: { color: '#FFD0B5', marginTop: 10, backgroundColor: 'rgba(255,107,0,.12)', padding: 10, borderRadius: 9 }
});






















































