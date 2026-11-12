import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { createDirectConversation } from '../services/social';

const profileColumns = 'id,username,full_name,avatar_url,bio';
const resultKinds = [
  { key: 'people', label: 'People' },
  { key: 'videos', label: 'Videos' },
  { key: 'hashtags', label: 'Hashtags' }
];

export default function DiscoverScreen({ navigation }) {
  const { user } = useAuth();
  const [people, setPeople] = useState([]);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('people');
  const [busy, setBusy] = useState(true);
  const [actionId, setActionId] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) { setBusy(false); return; }
    setBusy(true);
    setNotice('');
    try {
      const [profilesResult, followsResult, postsResult] = await Promise.all([
        supabase.from('profiles').select(profileColumns).neq('id', user.id).order('full_name', { ascending: true }).limit(200),
        supabase.from('follows').select('followed_id').eq('follower_id', user.id),
        supabase.from('posts').select('id,user_id,caption,media_url,media_type,created_at').eq('media_type', 'video').order('created_at', { ascending: false }).limit(100)
      ]);
      if (profilesResult.error) throw profilesResult.error;
      if (followsResult.error) throw followsResult.error;
      if (postsResult.error) throw postsResult.error;
      const postRows = postsResult.data || [];
      const creatorIds = [...new Set(postRows.map(post => post.user_id))];
      const creatorResult = creatorIds.length
        ? await supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', creatorIds)
        : { data: [], error: null };
      if (creatorResult.error) throw creatorResult.error;
      const creatorMap = Object.fromEntries((creatorResult.data || []).map(profile => [profile.id, profile]));
      setPeople(profilesResult.data || []);
      setPosts(postRows.map(post => ({ ...post, creator: creatorMap[post.user_id] || {} })));
      setFollowing(new Set((followsResult.data || []).map(row => row.followed_id)));
    } catch (error) {
      setNotice(`Could not load Discover: ${error?.message || 'Please try again.'}`);
    } finally {
      setBusy(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
    const channel = supabase.channel(`discover-${user?.id || 'guest'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, user?.id]);

  const term = query.trim().replace(/^@/, '').toLowerCase();
  const filteredPeople = useMemo(() => people.filter(person => !term || `${person.username || ''} ${person.full_name || ''} ${person.bio || ''}`.toLowerCase().includes(term)), [people, term]);
  const filteredPosts = useMemo(() => posts.filter(post => !term || `${post.caption || ''} ${post.creator?.username || ''} ${post.creator?.full_name || ''}`.toLowerCase().includes(term)), [posts, term]);
  const hashtags = useMemo(() => {
    const counts = new Map();
    posts.forEach(post => {
      (post.caption?.match(/#[\p{L}\p{N}_]+/gu) || []).forEach(tag => {
        const normalized = tag.toLowerCase();
        if (!term || normalized.includes(term.startsWith('#') ? term.slice(1) : term)) counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 40);
  }, [posts, term]);

  const toggleFollow = async person => {
    if (!user?.id || !person?.id || actionId) return;
    setActionId(person.id);
    setNotice('');
    const isFollowing = following.has(person.id);
    try {
      const result = isFollowing
        ? await supabase.from('follows').delete().eq('follower_id', user.id).eq('followed_id', person.id)
        : await supabase.from('follows').insert({ follower_id: user.id, followed_id: person.id });
      if (result.error) throw result.error;
      setFollowing(previous => { const next = new Set(previous); isFollowing ? next.delete(person.id) : next.add(person.id); return next; });
    } catch (error) {
      setNotice(`Follow update failed: ${error?.message || 'Please try again.'}`);
    } finally {
      setActionId('');
    }
  };

  const openProfile = person => navigation.navigate('ContactProfile', { contact: {
    id: person.id,
    name: person.full_name || person.username || 'KONNEKT member',
    username: person.username ? `@${person.username}` : '@member',
    avatar_url: person.avatar_url,
    bio: person.bio || '',
    initials: (person.full_name || person.username || 'K').slice(0, 1).toUpperCase(),
    onKonnekt: true
  }});

  const message = async person => {
    if (actionId) return;
    setActionId(person.id);
    setNotice('');
    try {
      const chatId = await createDirectConversation(user.id, person.id);
      navigation.navigate('ChatConversation', { chatId, chatName: person.full_name || (person.username ? `@${person.username}` : 'KONNEKT member') });
    } catch (error) {
      setNotice(`Could not open chat: ${error?.message || 'Please try again.'}`);
    } finally {
      setActionId('');
    }
  };

  const renderPerson = ({ item }) => {
    const isFollowing = following.has(item.id);
    const name = item.full_name || item.username || 'KONNEKT member';
    return <View style={s.person}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open ${name}'s profile`} style={s.identity} onPress={() => openProfile(item)}>
        {item.avatar_url ? <Image source={{ uri: item.avatar_url }} style={s.avatarImage} /> : <View style={s.avatar}><Text style={s.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View>}
        <View style={s.personCopy}><Text style={s.name} numberOfLines={1}>{item.full_name || 'KONNEKT member'}</Text><Text style={s.username}>{item.username ? `@${item.username}` : 'KONNEKT member'}</Text>{!!item.bio && <Text style={s.bio} numberOfLines={1}>{item.bio}</Text>}</View>
      </TouchableOpacity>
      <View style={s.actions}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={isFollowing ? `Unfollow ${name}` : `Follow ${name}`} style={[s.follow, isFollowing && s.following]} disabled={!!actionId} onPress={() => toggleFollow(item)}><Text style={s.followText}>{actionId === item.id ? '…' : isFollowing ? 'Following' : 'Follow'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={s.message} disabled={!!actionId} onPress={() => message(item)}><Text style={s.messageText}>{actionId === item.id ? '…' : 'Message'}</Text></TouchableOpacity>
      </View>
    </View>;
  };

  const renderVideo = ({ item }) => {
    const creator = item.creator?.username ? `@${item.creator.username}` : item.creator?.full_name || 'KONNEKT creator';
    return <TouchableOpacity accessibilityRole="button" style={s.videoCard} onPress={() => navigation.navigate('Reels')}>
      <View style={s.videoThumb}><Text style={s.play}>▶</Text><Text style={s.videoTag}>REEL</Text></View>
      <View style={s.videoCopy}><Text style={s.videoCaption} numberOfLines={2}>{item.caption || 'Watch this Reel'}</Text><Text style={s.username}>{creator}</Text></View>
      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>;
  };

  const renderHashtag = ({ item }) => <TouchableOpacity accessibilityRole="button" style={s.hashtagRow} onPress={() => { setQuery(item[0]); setKind('videos'); }}>
    <View style={s.hashIcon}><Text style={s.hashGlyph}>#</Text></View><View style={s.personCopy}><Text style={s.hashName}>{item[0]}</Text><Text style={s.username}>{item[1]} {item[1] === 1 ? 'video' : 'videos'}</Text></View><Text style={s.arrow}>›</Text>
  </TouchableOpacity>;

  const data = kind === 'people' ? filteredPeople : kind === 'videos' ? filteredPosts : hashtags;
  const emptyLabel = kind === 'people' ? 'No matching accounts found.' : kind === 'videos' ? 'No videos match that search yet.' : 'Hashtags appear here when creators add them to video captions.';

  return <View style={s.container}>
    <View style={s.header}><View><Text style={s.title}>Discover</Text><Text style={s.subtitle}>Find people, creators and videos on KONNEKT</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Refresh Discover" onPress={load} style={s.refresh}><Text style={s.refreshText}>↻</Text></TouchableOpacity></View>
    <TextInput style={s.search} value={query} onChangeText={setQuery} placeholder="Search names, creators, videos or #hashtags" placeholderTextColor="#C4B4D0" autoCapitalize="none" returnKeyType="search" accessibilityLabel="Search Discover" />
    <View style={s.filters} accessibilityRole="tablist">{resultKinds.map(option => <TouchableOpacity key={option.key} accessibilityRole="tab" accessibilityState={{ selected: kind === option.key }} style={[s.filter, kind === option.key && s.filterActive]} onPress={() => setKind(option.key)}><Text style={[s.filterText, kind === option.key && s.filterTextActive]}>{option.label}</Text></TouchableOpacity>)}</View>
    <Text style={s.section}>{term ? `${data.length} search results` : kind === 'people' ? 'Suggested accounts' : kind === 'videos' ? 'Recent videos' : 'Popular hashtags'}</Text>
    {busy && !people.length && !posts.length ? <ActivityIndicator color="#FFC107" style={{ marginTop: 35 }} /> : <FlatList
      data={data}
      keyExtractor={item => kind === 'people' ? item.id : kind === 'videos' ? item.id : item[0]}
      renderItem={kind === 'people' ? renderPerson : kind === 'videos' ? renderVideo : renderHashtag}
      onRefresh={load}
      refreshing={busy}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={<Text style={s.empty}>{emptyLabel}</Text>}
    />}
    {!!notice && <Text accessibilityRole="alert" style={s.notice}>{notice}</Text>}
  </View>;
}

const s = StyleSheet.create({
  container: { flex: 1, minHeight: 0, backgroundColor: '#10091B', padding: 18 },
  header: { marginTop: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { color: '#FAF8FF', fontSize: 27, fontWeight: '800' },
  subtitle: { color: '#C4B4D0', marginTop: 4, fontSize: 11 },
  refresh: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#241630', alignItems: 'center', justifyContent: 'center' },
  refreshText: { color: '#00E6FF', fontSize: 23 },
  search: { backgroundColor: '#241630', borderWidth: 1, borderColor: '#39244B', color: '#FAF8FF', padding: 13, borderRadius: 12, marginBottom: 12 },
  filters: { flexDirection: 'row', backgroundColor: '#170D26', borderRadius: 12, padding: 4, gap: 4 },
  filter: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  filterActive: { backgroundColor: '#6A0DAD' },
  filterText: { color: '#C4B4D0', fontWeight: '700', fontSize: 12 },
  filterTextActive: { color: '#FFF' },
  section: { color: '#FFC107', fontWeight: '800', fontSize: 12, letterSpacing: 1, marginTop: 17, marginBottom: 5, textTransform: 'uppercase' },
  person: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#39244B', gap: 9 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#3A0CA3', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#241630' },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  personCopy: { flex: 1, minWidth: 0 },
  name: { color: '#FAF8FF', fontSize: 14, fontWeight: '800' },
  username: { color: '#C4B4D0', fontSize: 11, marginTop: 3 },
  bio: { color: '#A998B8', fontSize: 10, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  follow: { backgroundColor: '#FF6B00', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, minWidth: 76, alignItems: 'center' },
  following: { backgroundColor: '#241630', borderWidth: 1, borderColor: '#FFC107' },
  followText: { color: '#FFF', fontWeight: '800', fontSize: 11 },
  message: { backgroundColor: '#3A0CA3', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18 },
  messageText: { color: '#FFF', fontWeight: '800', fontSize: 11 },
  videoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, marginVertical: 5, backgroundColor: '#170D26', borderWidth: 1, borderColor: '#39244B', borderRadius: 13 },
  videoThumb: { width: 58, height: 70, borderRadius: 9, backgroundColor: '#3A0CA3', alignItems: 'center', justifyContent: 'center' },
  play: { color: '#FFC107', fontSize: 20 },
  videoTag: { color: '#FFF', fontSize: 8, fontWeight: '900', marginTop: 5 },
  videoCopy: { flex: 1, minWidth: 0 },
  videoCaption: { color: '#FAF8FF', fontSize: 13, fontWeight: '700' },
  arrow: { color: '#00E6FF', fontSize: 25 },
  hashtagRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderColor: '#39244B' },
  hashIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3A0CA3', alignItems: 'center', justifyContent: 'center' },
  hashGlyph: { color: '#00E6FF', fontSize: 21, fontWeight: '900' },
  hashName: { color: '#FAF8FF', fontSize: 14, fontWeight: '800' },
  empty: { color: '#C4B4D0', textAlign: 'center', padding: 22, lineHeight: 20, fontSize: 12 },
  notice: { color: '#FFD0B5', padding: 10, backgroundColor: 'rgba(255,107,0,.12)', borderRadius: 9, marginTop: 8, fontSize: 12 }
});
