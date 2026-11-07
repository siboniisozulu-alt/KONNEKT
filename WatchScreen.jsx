import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, TextInput, Image, Dimensions } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { chooseMedia, uploadMedia } from '../services/media';

const MAX_VIDEO_BYTES = 45 * 1024 * 1024;
const REEL_PAGE_HEIGHT = Math.max(500, Dimensions.get('window').height - 250);

export default function WatchScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState(new Set());
  const [following, setFollowing] = useState(new Set());
  const [followBusy, setFollowBusy] = useState('');
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [busy, setBusy] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) { setBusy(false); return; }
    try {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(60);
      if (error) throw error;
      const rows = data || [];
      const postIds = rows.map(p => p.id);
      const profileIds = [...new Set(rows.map(p => p.user_id))];
      const [profileResult, myLikesResult, allLikesResult, commentsResult, followsResult] = await Promise.all([
        profileIds.length ? supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', profileIds) : Promise.resolve({ data: [], error: null }),
        supabase.from('post_likes').select('post_id').eq('user_id', user.id),
        postIds.length ? supabase.from('post_likes').select('post_id') .in('post_id', postIds) : Promise.resolve({ data: [], error: null }),
        postIds.length ? supabase.from('post_comments').select('id,post_id,user_id,body,created_at').in('post_id', postIds).order('created_at', { ascending: true }) : Promise.resolve({ data: [], error: null }),
        supabase.from('follows').select('followed_id').eq('follower_id', user.id)
      ]);
      if (profileResult.error) throw profileResult.error;
      if (myLikesResult.error) throw myLikesResult.error;
      if (allLikesResult.error) throw allLikesResult.error;
      if (commentsResult.error) throw commentsResult.error;
      if (followsResult.error) throw followsResult.error;
      const profiles = profileResult.data || [];
      const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
      const commentRows = commentsResult.data || [];
      const commentUserIds = [...new Set(commentRows.map(c => c.user_id))];
      const { data: commentProfiles, error: commentProfileError } = commentUserIds.length
        ? await supabase.from('profiles').select('id,username,full_name').in('id', commentUserIds)
        : { data: [], error: null };
      if (commentProfileError) throw commentProfileError;
      const commentProfileMap = Object.fromEntries((commentProfiles || []).map(p => [p.id, p]));
      const grouped = {};
      commentRows.forEach(c => { (grouped[c.post_id] ||= []).push({ ...c, profile: commentProfileMap[c.user_id] }); });
      const counts = {};
      (allLikesResult.data || []).forEach(x => { counts[x.post_id] = (counts[x.post_id] || 0) + 1; });
      setComments(grouped);
      setLikeCounts(counts);
      setLiked(new Set((myLikesResult.data || []).map(x => x.post_id)));
      setFollowing(new Set((followsResult.data || []).map(x => x.followed_id)));
      setPosts(rows.map(p => ({ ...p, profile: profileMap[p.user_id] })));
      setNotice('');
    } catch (e) {
      setNotice(e?.message || 'Could not load Reels. Please refresh and try again.');
    } finally {
      setBusy(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
    const channel = supabase.channel(`konnekt-reels-${user?.id || 'guest'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, load)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, user?.id]);

  const publish = async () => {
    try {
      const file = await chooseMedia('video/mp4,video/webm,video/quicktime');
      if (!file) return;
      if (!file.type?.startsWith('video/')) throw new Error('Please select a video file.');
      if (file.size > MAX_VIDEO_BYTES) throw new Error('Choose a video smaller than 45 MB to stay within the current free-tier upload limit.');
      setUploading(true);
      setNotice('Uploading your video…');
      const media = await uploadMedia(file, 'konnekt-public-media', `posts/${user.id}`);
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        caption: caption.trim(),
        media_url: media.url,
        media_type: 'video'
      });
      if (error) throw error;
      setCaption('');
      setNotice('Your Reel has been published.');
      await load();
    } catch (e) {
      setNotice(e?.message || 'Video upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleLike = async post => {
    const wasLiked = liked.has(post.id);
    setLiked(previous => {
      const next = new Set(previous);
      wasLiked ? next.delete(post.id) : next.add(post.id);
      return next;
    });
    setLikeCounts(previous => ({ ...previous, [post.id]: Math.max(0, (previous[post.id] || 0) + (wasLiked ? -1 : 1)) }));
    const result = wasLiked
      ? await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      : await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
    if (result.error) { setNotice(result.error.message); await load(); }
  };

  const toggleFollow = async creatorId => {
    if (!creatorId || creatorId === user?.id || followBusy) return;
    const alreadyFollowing = following.has(creatorId);
    setFollowBusy(creatorId);
    setNotice('');
    const result = alreadyFollowing
      ? await supabase.from('follows').delete().eq('follower_id', user.id).eq('followed_id', creatorId)
      : await supabase.from('follows').insert({ follower_id: user.id, followed_id: creatorId });
    setFollowBusy('');
    if (result.error) {
      setNotice(result.error.message);
      return;
    }
    setFollowing(previous => {
      const next = new Set(previous);
      alreadyFollowing ? next.delete(creatorId) : next.add(creatorId);
      return next;
    });
  };

  const openCreator = item => {
    const p = item.profile || {};
    navigation?.navigate?.('ContactProfile', { contact: {
      id: item.user_id,
      name: p.full_name || p.username || 'KONNEKT member',
      username: p.username ? `@${p.username}` : '@member',
      initials: (p.full_name || p.username || 'K').slice(0, 2).toUpperCase(),
      bio: p.bio || 'KONNEKT creator',
      onKonnekt: true
    }});
  };

  const addComment = async post => {
    const body = (commentDrafts[post.id] || '').trim();
    if (!body) return;
    const { error } = await supabase.from('post_comments').insert({ post_id: post.id, user_id: user.id, body });
    if (error) setNotice(error.message);
    else setCommentDrafts(previous => ({ ...previous, [post.id]: '' }));
    await load();
  };

  const renderReel = ({ item }) => {
    const postComments = comments[item.id] || [];
    const creator = item.profile?.username ? `@${item.profile.username}` : 'KONNEKT member';
    return (
      <View style={s.reelCard}>
        <View style={s.creatorRow}>
          <TouchableOpacity style={s.creatorIdentity} onPress={() => openCreator(item)} accessibilityRole="button" accessibilityLabel="Open creator profile">
            <View style={s.creatorAvatar}><Text style={s.creatorAvatarText}>{(item.profile?.full_name || item.profile?.username || 'K').slice(0, 1).toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.creator}>{creator}</Text>
              <Text style={s.creatorName}>{item.profile?.full_name || 'KONNEKT creator'}</Text>
            </View>
          </TouchableOpacity>
          {item.user_id !== user?.id && <TouchableOpacity onPress={() => toggleFollow(item.user_id)} disabled={followBusy === item.user_id} style={[s.followButton, following.has(item.user_id) && s.followingButton]}>
            <Text style={s.followText}>{followBusy === item.user_id ? '…' : following.has(item.user_id) ? 'Following' : '＋ Follow'}</Text>
          </TouchableOpacity>}
        </View>
        <View style={s.mediaFrame}>
          {item.media_type === 'image' ? (
            <Image source={{ uri: item.media_url }} style={s.media} resizeMode="contain" />
          ) : (
            <video src={item.media_url} controls playsInline loop preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000', borderRadius: 14 }} />
          )}
        </View>
        {!!item.caption && <Text style={s.caption}>{item.caption}</Text>}
        <View style={s.actions}>
          <TouchableOpacity accessibilityRole="button" onPress={() => toggleLike(item)} style={s.actionButton}>
            <Text style={s.action}>{liked.has(item.id) ? '❤️ Liked' : '🤍 Like'} · {likeCounts[item.id] || 0}</Text>
          </TouchableOpacity>
          <Text style={s.action}>💬 {postComments.length} comments</Text>
        </View>
        {postComments.slice(-2).map(comment => (
          <Text key={comment.id} style={s.comment}>
            <Text style={s.commentUser}>@{comment.profile?.username || 'member'} </Text>{comment.body}
          </Text>
        ))}
        <View style={s.commentRow}>
          <TextInput value={commentDrafts[item.id] || ''} onChangeText={value => setCommentDrafts(previous => ({ ...previous, [item.id]: value }))} placeholder="Add a comment…" placeholderTextColor="#8293A8" style={s.commentInput} maxLength={2000} />
          <TouchableOpacity onPress={() => addComment(item)} style={s.commentSend} disabled={!(commentDrafts[item.id] || '').trim()}>
            <Text style={s.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const empty = useMemo(() => <View style={s.emptyWrap}><Text style={s.emptyIcon}>🎬</Text><Text style={s.emptyTitle}>Your Reels feed starts here</Text><Text style={s.empty}>No videos have been shared yet. Upload the first Reel and invite other members to join in.</Text></View>, []);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View><Text style={s.title}>Reels</Text><Text style={s.sub}>Discover videos from the KONNEKT community</Text></View>
        <TouchableOpacity onPress={publish} style={[s.upload, uploading && s.uploadDisabled]} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#FFF" /> : <Text style={s.uploadText}>＋ Create Reel</Text>}
        </TouchableOpacity>
      </View>
      <TextInput style={s.input} value={caption} onChangeText={setCaption} placeholder="Add a caption before uploading (optional)" placeholderTextColor="#8293A8" maxLength={500} />
      {!!notice && <Text style={s.notice}>{notice}</Text>}
      {busy ? <ActivityIndicator color="#168BFF" style={{ marginTop: 35 }} /> : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderReel}
          pagingEnabled
          snapToInterval={REEL_PAGE_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: REEL_PAGE_HEIGHT, offset: REEL_PAGE_HEIGHT * index, index })}
          onRefresh={load}
          refreshing={busy}
          contentContainerStyle={posts.length ? s.feedContent : s.emptyContent}
          ListEmptyComponent={empty}
          showsVerticalScrollIndicator={false}
        />
      )}
      <Text style={s.footer}>Keep videos short, respectful and safe to share.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, minHeight: 0, backgroundColor: '#07111F', paddingHorizontal: 14, paddingTop: 8 },
  header: { marginTop: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { color: '#FFF', fontSize: 27, fontWeight: 'bold' },
  sub: { color: '#8293A8', marginTop: 3, fontSize: 11 },
  upload: { backgroundColor: '#168BFF', paddingHorizontal: 13, paddingVertical: 11, borderRadius: 11 },
  uploadDisabled: { opacity: 0.65 },
  uploadText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  input: { backgroundColor: '#14243A', borderWidth: 1, borderColor: '#263A53', borderRadius: 11, padding: 12, color: '#FFF', marginBottom: 9 },
  notice: { color: '#9FD3FF', marginBottom: 8, fontSize: 12 },
  feedContent: { paddingBottom: 12 },
  emptyContent: { flexGrow: 1, justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', padding: 28 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  empty: { color: '#9AABC0', textAlign: 'center', lineHeight: 22, maxWidth: 340 },
  reelCard: { backgroundColor: '#07111F', height: REEL_PAGE_HEIGHT, padding: 12, marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#263A53', justifyContent: 'flex-start' },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  creatorIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 0 },
  followButton: { backgroundColor: '#168BFF', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18 },
  followingButton: { backgroundColor: '#263A53', borderWidth: 1, borderColor: '#4B6683' },
  followText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  creatorAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#193B5C', alignItems: 'center', justifyContent: 'center' },
  creatorAvatarText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  creator: { color: '#A9D8FF', fontWeight: 'bold', fontSize: 13 },
  creatorName: { color: '#8293A8', fontSize: 10, marginTop: 2 },
  reelDate: { color: '#8293A8', fontSize: 10 },
  mediaFrame: { width: '100%', flex: 1, minHeight: 220, backgroundColor: '#000', borderRadius: 14, overflow: 'hidden' },
  media: { width: '100%', height: '100%', backgroundColor: '#000' },
  caption: { color: '#FFF', marginTop: 10, lineHeight: 19, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 18, alignItems: 'center', paddingVertical: 11 },
  actionButton: { paddingVertical: 2 },
  action: { color: '#DCEBFA', fontWeight: '600', fontSize: 12 },
  comment: { color: '#CBD8E8', fontSize: 11, marginTop: 5, lineHeight: 17 },
  commentUser: { color: '#64B9FF', fontWeight: 'bold' },
  commentRow: { flexDirection: 'row', gap: 7, marginTop: 10 },
  commentInput: { flex: 1, backgroundColor: '#1B3048', color: '#FFF', padding: 10, borderRadius: 9, minWidth: 0 },
  commentSend: { backgroundColor: '#168BFF', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 9 },
  sendText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  footer: { color: '#65788F', textAlign: 'center', fontSize: 9, paddingVertical: 5 }
});
