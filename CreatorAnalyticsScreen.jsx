import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';

const periods = [{ label: '7 days', days: 7 }, { label: '30 days', days: 30 }, { label: '90 days', days: 90 }];
export default function CreatorAnalyticsScreen({ navigation }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(periods[0]);
  const [metrics, setMetrics] = useState({ posts: 0, views: 0, likes: 0, comments: 0, followers: 0 });
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    if (!user?.id) return;
    setBusy(true); setNotice('');
    try {
      const since = new Date(Date.now() - selected.days * 86400000).toISOString();
      const { data: posts, error: postError } = await supabase.from('posts').select('id').eq('user_id', user.id).gte('created_at', since);
      if (postError) throw postError;
      const ids = (posts || []).map(post => post.id);
      let views = 0, likes = 0, comments = 0;
      if (ids.length) {
        const [viewResult, likeResult, commentResult] = await Promise.all([
          supabase.from('post_views').select('post_id', { count: 'exact', head: true }).in('post_id', ids).gte('viewed_at', since),
          supabase.from('post_likes').select('post_id', { count: 'exact', head: true }).in('post_id', ids).gte('created_at', since),
          supabase.from('post_comments').select('id', { count: 'exact', head: true }).in('post_id', ids).gte('created_at', since)
        ]);
        if (viewResult.error) throw viewResult.error;
        if (likeResult.error) throw likeResult.error;
        if (commentResult.error) throw commentResult.error;
        views = viewResult.count || 0; likes = likeResult.count || 0; comments = commentResult.count || 0;
      }
      const { count: followers, error: followerError } = await supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('followed_id', user.id).gte('created_at', since);
      if (followerError) throw followerError;
      setMetrics({ posts: ids.length, views, likes, comments, followers: followers || 0 });
    } catch (error) { setNotice(error.message || 'Could not load creator analytics.'); }
    finally { setBusy(false); }
  }, [user?.id, selected.days]);
  useEffect(() => { load(); }, [load]);
  const cards = [{ label: 'Posts published', value: metrics.posts, icon: '🎬' }, { label: 'Unique views', value: metrics.views, icon: '👁' }, { label: 'Likes received', value: metrics.likes, icon: '❤️' }, { label: 'Comments received', value: metrics.comments, icon: '💬' }, { label: 'New followers', value: metrics.followers, icon: '👥' }];
  return <ScrollView style={s.container} contentContainerStyle={s.content}>
    <View style={s.header}><TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>‹ Back</Text></TouchableOpacity><Text style={s.title}>Creator analytics</Text><TouchableOpacity onPress={load}><Text style={s.refresh}>↻</Text></TouchableOpacity></View>
    <Text style={s.subtitle}>Real engagement totals for your posts and followers. Views are unique account views per post. Shares are not counted because share tracking is not implemented yet.</Text>
    <View style={s.periods}>{periods.map(period => <TouchableOpacity key={period.label} style={[s.period, selected.label === period.label && s.active]} onPress={() => setSelected(period)}><Text style={s.periodText}>{period.label}</Text></TouchableOpacity>)}</View>
    {busy ? <ActivityIndicator color="#168BFF" style={{ marginTop: 40 }}/> : <View style={s.grid}>{cards.map(card => <View key={card.label} style={s.card}><Text style={s.icon}>{card.icon}</Text><Text style={s.value}>{card.value.toLocaleString()}</Text><Text style={s.label}>{card.label}</Text></View>)}</View>}
    {!!notice && <Text style={s.error}>{notice}</Text>}
    <Text style={s.foot}>Period: last {selected.days} days. These are account-level totals, not estimated reach or earnings.</Text>
  </ScrollView>;
}
const s=StyleSheet.create({container:{flex:1,backgroundColor:'#07111F'},content:{padding:18,paddingBottom:35},header:{marginTop:20,marginBottom:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},back:{color:'#168BFF',fontSize:16},title:{color:'#FFF',fontSize:22,fontWeight:'bold'},refresh:{color:'#8CCBFF',fontSize:23},subtitle:{color:'#9EB0C4',lineHeight:19,marginBottom:18},periods:{flexDirection:'row',gap:8,marginBottom:18},period:{flex:1,padding:11,borderRadius:9,backgroundColor:'#14243A',alignItems:'center'},active:{backgroundColor:'#168BFF'},periodText:{color:'#FFF',fontWeight:'bold',fontSize:11},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},card:{width:'48%',backgroundColor:'#14243A',borderRadius:14,padding:16,minHeight:125},icon:{fontSize:22},value:{color:'#FFF',fontSize:25,fontWeight:'bold',marginTop:10},label:{color:'#9EB0C4',fontSize:11,marginTop:4},error:{color:'#FF9CA8',marginTop:14},foot:{color:'#74869B',fontSize:10,lineHeight:15,marginTop:20}});
