import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';

export default function HashtagScreen({ navigation, route }) {
  const { user } = useAuth();
  const [search, setSearch] = useState(String(route?.params?.hashtag || '').replace(/^#/, ''));
  const [trending, setTrending] = useState([]);
  const [selected, setSelected] = useState(String(route?.params?.hashtag || '').replace(/^#/, '').toLowerCase());
  const [posts, setPosts] = useState([]);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');
  const loadTrending = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase.from('konnekt_trending_hashtags').select('hashtag,post_count,latest_post_at').limit(40);
    if (error) throw error;
    setTrending(data || []);
  }, [user?.id]);
  const loadPosts = useCallback(async tag => {
    if (!tag || !user?.id) { setPosts([]); return; }
    const { data: links, error } = await supabase.from('post_hashtags').select('post_id').eq('hashtag', tag).limit(60);
    if (error) throw error;
    const ids = (links || []).map(row => row.post_id);
    if (!ids.length) { setPosts([]); return; }
    const { data, error: postsError } = await supabase.from('posts').select('id,user_id,caption,media_url,media_type,created_at').in('id', ids).order('created_at', { ascending: false });
    if (postsError) throw postsError;
    setPosts(data || []);
  }, [user?.id]);
  useEffect(() => { let active = true; (async () => { setBusy(true); try { await loadTrending(); if (selected) await loadPosts(selected); } catch (error) { if (active) setNotice(error.message); } finally { if (active) setBusy(false); } })(); return () => { active = false; }; }, [loadTrending, loadPosts, selected]);
  const filtered = useMemo(() => trending.filter(item => item.hashtag.toLowerCase().includes(search.trim().replace(/^#/, '').toLowerCase())), [trending, search]);
  const open = async tag => { setSelected(tag.toLowerCase()); setSearch(tag); };
  const openReels = () => navigation.navigate('Watch', { hashtag: selected });
  return <View style={s.container}>
    <View style={s.header}><TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>‹</Text></TouchableOpacity><Text style={s.title}>Explore hashtags</Text><Text style={s.hash}>#</Text></View>
    <TextInput style={s.search} placeholder="Search hashtags" placeholderTextColor="#8293A8" value={search} onChangeText={setSearch} autoCapitalize="none"/>
    <Text style={s.section}>Trending this week</Text>
    {busy ? <ActivityIndicator color="#168BFF" style={{ marginTop: 20 }}/> : <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
      {filtered.map(item => <TouchableOpacity key={item.hashtag} style={[s.tagRow, selected === item.hashtag && s.selected]} onPress={() => open(item.hashtag)}><View style={{ flex: 1 }}><Text style={s.tag}>#{item.hashtag}</Text><Text style={s.count}>{item.post_count} posts in the last 7 days</Text></View><Text style={s.arrow}>›</Text></TouchableOpacity>)}
      {!filtered.length && <Text style={s.empty}>No matching hashtags yet. Hashtags appear after members publish posts with #tags.</Text>}
      {!!selected && <View style={s.results}><Text style={s.section}>Posts using #{selected}</Text>{posts.slice(0,8).map(post => <View key={post.id} style={s.post}><Text style={s.postCaption}>{post.caption || 'KONNEKT post'}</Text><Text style={s.count}>{post.media_type} · {new Date(post.created_at).toLocaleDateString()}</Text></View>)}{!posts.length && <Text style={s.empty}>No posts found for this hashtag.</Text>}<TouchableOpacity style={s.openButton} onPress={openReels}><Text style={s.openText}>Open #{selected} in Reels</Text></TouchableOpacity></View>}
    </ScrollView>}
    {!!notice && <Text style={s.notice}>{notice}</Text>}
  </View>;
}
const s=StyleSheet.create({container:{flex:1,backgroundColor:'#07111F',padding:18},header:{marginTop:20,marginBottom:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},back:{color:'#168BFF',fontSize:32},title:{color:'#FFF',fontSize:21,fontWeight:'bold'},hash:{color:'#8CCBFF',fontSize:26,fontWeight:'bold'},search:{backgroundColor:'#14243A',borderWidth:1,borderColor:'#263A53',borderRadius:11,padding:14,color:'#FFF',marginBottom:18},section:{color:'#E5F1FF',fontWeight:'bold',fontSize:15,marginBottom:10},tagRow:{backgroundColor:'#14243A',borderRadius:11,padding:14,marginBottom:8,flexDirection:'row',alignItems:'center'},selected:{borderWidth:1,borderColor:'#168BFF'},tag:{color:'#8CCBFF',fontWeight:'bold',fontSize:15},count:{color:'#8293A8',fontSize:10,marginTop:4},arrow:{color:'#8CCBFF',fontSize:24},empty:{color:'#8293A8',textAlign:'center',lineHeight:20,marginTop:24},results:{marginTop:20},post:{backgroundColor:'#14243A',borderRadius:10,padding:12,marginBottom:7},postCaption:{color:'#FFF',fontSize:13},openButton:{backgroundColor:'#168BFF',padding:13,borderRadius:10,alignItems:'center',marginTop:10},openText:{color:'#FFF',fontWeight:'bold'},notice:{color:'#FF9CA8',marginTop:10}});
