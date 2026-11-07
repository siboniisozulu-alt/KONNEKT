import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, TextInput, Image } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { chooseMedia, uploadMedia } from '../services/media';

export default function WatchScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState(new Set());
  const [comments, setComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [busy, setBusy] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(60);
    if (error) { setNotice(error.message); setBusy(false); return; }
    const ids = [...new Set((data || []).map(p => p.user_id))];
    const [{ data: profiles }, { data: myLikes }, { data: allComments }] = await Promise.all([
      ids.length ? supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', ids) : Promise.resolve({ data: [] }),
      supabase.from('post_likes').select('post_id').eq('user_id', user.id),
      (data || []).length ? supabase.from('post_comments').select('id,post_id,user_id,body,created_at').in('post_id', data.map(p => p.id)).order('created_at', { ascending: true }) : Promise.resolve({ data: [] })
    ]);
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
    const commentUserIds = [...new Set((allComments || []).map(c => c.user_id))];
    const { data: commentProfiles } = commentUserIds.length ? await supabase.from('profiles').select('id,username,full_name').in('id', commentUserIds) : { data: [] };
    const commentProfileMap = Object.fromEntries((commentProfiles || []).map(p => [p.id, p]));
    const grouped = {};
    (allComments || []).forEach(c => { (grouped[c.post_id] ||= []).push({ ...c, profile: commentProfileMap[c.user_id] }); });
    setComments(grouped);
    setLiked(new Set((myLikes || []).map(x => x.post_id)));
    setPosts((data || []).map(p => ({ ...p, profile: profileMap[p.user_id] })));
    setBusy(false); setNotice('');
  }, [user?.id]);

  useEffect(() => {
    load();
    const ch = supabase.channel('konnekt-reels-feed').on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, load)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const publish = async () => {
    try {
      const file = await chooseMedia('video/*,image/*');
      if (!file) return;
      setUploading(true); setNotice('');
      const media = await uploadMedia(file, 'konnekt-public-media', `posts/${user.id}`);
      const { error } = await supabase.from('posts').insert({ user_id: user.id, caption: caption.trim(), media_url: media.url, media_type: media.type });
      if (error) throw error;
      setCaption(''); setNotice('Your post is now published.'); await load();
    } catch (e) { setNotice(e.message || 'Upload failed.'); }
    finally { setUploading(false); }
  };

  const toggleLike = async post => {
    const was = liked.has(post.id);
    setLiked(prev => { const next = new Set(prev); was ? next.delete(post.id) : next.add(post.id); return next; });
    const result = was
      ? await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      : await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
    if (result.error) { setNotice(result.error.message); await load(); }
  };

  const addComment = async post => {
    const body = (commentDrafts[post.id] || '').trim();
    if (!body) return;
    const { error } = await supabase.from('post_comments').insert({ post_id: post.id, user_id: user.id, body });
    if (error) setNotice(error.message); else setCommentDrafts(p => ({ ...p, [post.id]: '' }));
    await load();
  };

  const render = ({ item }) => {
    const postComments = comments[item.id] || [];
    return <View style={s.card}>
      <Text style={s.creator}>@{item.profile?.username || 'konnekt_member'} · {item.profile?.full_name || 'KONNEKT creator'}</Text>
      {item.media_type === 'image'
        ? <Image source={{ uri: item.media_url }} style={s.media} resizeMode="contain" />
        : <video src={item.media_url} controls playsInline preload="metadata" style={{ width: '100%', maxHeight: 520, backgroundColor: '#000', borderRadius: 12 }} />}
      {!!item.caption && <Text style={s.caption}>{item.caption}</Text>}
      <View style={s.actions}>
        <TouchableOpacity onPress={() => toggleLike(item)}><Text style={s.action}>{liked.has(item.id) ? '❤️ Liked' : '🤍 Like'}</Text></TouchableOpacity>
        <Text style={s.action}>💬 {postComments.length}</Text>
        <Text style={s.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      {postComments.slice(-3).map(c => <Text key={c.id} style={s.comment}><Text style={s.commentUser}>@{c.profile?.username || 'member'} </Text>{c.body}</Text>)}
      <View style={s.commentRow}><TextInput value={commentDrafts[item.id] || ''} onChangeText={v => setCommentDrafts(p => ({ ...p, [item.id]: v }))} placeholder="Write a comment..." placeholderTextColor="#8293A8" style={s.commentInput} maxLength={2000}/><TouchableOpacity onPress={() => addComment(item)} style={s.commentSend}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Send</Text></TouchableOpacity></View>
    </View>;
  };

  return <View style={s.container}>
    <View style={s.header}><View><Text style={s.title}>KONNEKT Reels</Text><Text style={s.sub}>Videos, moments and creativity</Text></View><TouchableOpacity onPress={publish} style={s.upload} disabled={uploading}>{uploading ? <ActivityIndicator color="#FFF"/> : <Text style={s.uploadText}>＋ Upload</Text>}</TouchableOpacity></View>
    <TextInput style={s.input} value={caption} onChangeText={setCaption} placeholder="Write a caption for your upload (optional)" placeholderTextColor="#8293A8" maxLength={500}/>
    {!!notice && <Text style={s.notice}>{notice}</Text>}
    {busy ? <ActivityIndicator color="#168BFF" style={{ marginTop: 30 }}/> : <FlatList data={posts} keyExtractor={x => x.id} renderItem={render} onRefresh={load} refreshing={busy} ListEmptyComponent={<Text style={s.empty}>No posts yet. Share the first photo or video with the KONNEKT community.</Text>}/>}
  </View>;
}
const s = StyleSheet.create({ container:{flex:1,backgroundColor:'#07111F',padding:16},header:{marginTop:22,marginBottom:15,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},title:{color:'#FFF',fontSize:25,fontWeight:'bold'},sub:{color:'#8293A8',marginTop:4,fontSize:11},upload:{backgroundColor:'#168BFF',paddingHorizontal:14,paddingVertical:11,borderRadius:10},uploadText:{color:'#FFF',fontWeight:'bold'},input:{backgroundColor:'#14243A',borderRadius:10,padding:12,color:'#FFF',marginBottom:10},card:{backgroundColor:'#102238',borderRadius:15,padding:12,marginBottom:18,borderWidth:1,borderColor:'#263A53'},creator:{color:'#A9D8FF',fontWeight:'bold',marginBottom:10},media:{width:'100%',height:350,backgroundColor:'#000',borderRadius:12},caption:{color:'#FFF',marginTop:10,lineHeight:20},actions:{flexDirection:'row',gap:20,alignItems:'center',paddingVertical:12},action:{color:'#DCEBFA',fontWeight:'600'},date:{color:'#8293A8',fontSize:10,marginLeft:'auto'},comment:{color:'#CBD8E8',fontSize:12,marginTop:6},commentUser:{color:'#64B9FF',fontWeight:'bold'},commentRow:{flexDirection:'row',gap:7,marginTop:10},commentInput:{flex:1,backgroundColor:'#1B3048',color:'#FFF',padding:10,borderRadius:9},commentSend:{backgroundColor:'#168BFF',paddingHorizontal:12,justifyContent:'center',borderRadius:9},notice:{color:'#FFB6C0',marginBottom:8},empty:{color:'#9AABC0',textAlign:'center',marginTop:60,lineHeight:22}});
