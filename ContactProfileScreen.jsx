import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { createDirectConversation } from '../services/social';
import { blockKonnektUser } from '../services/safety';
import { Alert } from 'react-native';

export default function ContactProfileScreen({ navigation, route }) {
  const { user } = useAuth();
  const initial = route?.params?.contact || {};
  const personId = initial.id;
  const [profile, setProfile] = useState(initial);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [busy, setBusy] = useState(true);
  const [action, setAction] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!personId || !user?.id) { setBusy(false); return; }
    setBusy(true); setNotice('');
    try {
      const [p, f, fr, fg, posts] = await Promise.all([
        supabase.from('profiles').select('id,username,full_name,avatar_url,bio,encryption_public_key').eq('id', personId).maybeSingle(),
        supabase.from('follows').select('followed_id').eq('follower_id', user.id).eq('followed_id', personId).maybeSingle(),
        supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('followed_id', personId),
        supabase.from('follows').select('followed_id', { count: 'exact', head: true }).eq('follower_id', personId),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', personId)
      ]);
      if (p.error) throw p.error;
      if (f.error) throw f.error;
      if (fr.error) throw fr.error;
      if (fg.error) throw fg.error;
      if (posts.error) throw posts.error;
      if (p.data) setProfile({ ...initial, ...p.data });
      setFollowing(!!f.data); setFollowersCount(fr.count || 0); setFollowingCount(fg.count || 0); setPostCount(posts.count || 0);
    } catch (error) { setNotice(`Could not load profile details: ${error.message || 'Please try again.'}`); }
    finally { setBusy(false); }
  }, [personId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const toggleFollow = async () => {
    if (!personId || personId === user?.id || action) return;
    setAction(true); setNotice('');
    try {
      const result = following
        ? await supabase.from('follows').delete().eq('follower_id', user.id).eq('followed_id', personId)
        : await supabase.from('follows').insert({ follower_id: user.id, followed_id: personId });
      if (result.error) throw result.error;
      setFollowing(!following); setFollowersCount(value => Math.max(0, value + (following ? -1 : 1)));
    } catch (error) { setNotice(`Could not update follow: ${error.message || 'Please try again.'}`); }
    finally { setAction(false); }
  };

  const message = async () => {
    if (!personId || !user?.id) return;
    setAction(true); setNotice('');
    try {
      const chatId = await createDirectConversation(user.id, personId);
      navigation.navigate('ChatConversation', { chatId, chatName: profile.full_name || (profile.username ? `@${profile.username}` : 'KONNEKT member') });
    } catch (error) { setNotice(`Could not start a conversation: ${error.message || 'Please try again.'}`); }
    finally { setAction(false); }
  };

  const name = profile.full_name || profile.name || profile.username?.replace(/^@/, '') || 'KONNEKT member';
  const username = profile.username ? (profile.username.startsWith('@') ? profile.username : `@${profile.username}`) : '@member';
  const isMe = personId && personId === user?.id;

  return <ScrollView style={s.container} contentContainerStyle={s.content}>
    <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>‹ Back</Text></TouchableOpacity>
    <View style={s.profileSection}>
      {profile.avatar_url ? <Image source={{ uri: profile.avatar_url }} style={s.avatarImage}/> : <View style={s.avatar}><Text style={s.avatarText}>{(name || 'K').slice(0,1).toUpperCase()}</Text></View>}
      <Text style={s.name}>{name}</Text><Text style={s.username}>{username}</Text><Text style={s.memberStatus}>KONNEKT Member</Text>
      <View style={s.stats}><View style={s.stat}><Text style={s.statNum}>{postCount}</Text><Text style={s.statLabel}>Posts</Text></View><View style={s.stat}><Text style={s.statNum}>{followersCount}</Text><Text style={s.statLabel}>Followers</Text></View><View style={s.stat}><Text style={s.statNum}>{followingCount}</Text><Text style={s.statLabel}>Following</Text></View></View>
    </View>
    {!isMe && <View style={s.actionRow}>
      <TouchableOpacity style={[s.followButton, following && s.followingButton]} onPress={toggleFollow} disabled={action}><Text style={s.followText}>{action ? 'Please wait…' : following ? 'Following · Unfollow' : '+ Follow'}</Text></TouchableOpacity>
      <TouchableOpacity style={s.messageButton} onPress={message} disabled={action}><Text style={s.messageText}>Message</Text></TouchableOpacity><TouchableOpacity style={s.messageButton} onPress={() => navigation.navigate('IdentityVerification', { contact: { ...profile, id: personId, name } })}><Text style={s.messageText}>Verify key</Text></TouchableOpacity>
    </View>}
    {!isMe && <View style={s.safetyRow}><TouchableOpacity style={s.safetyButton} onPress={() => navigation.navigate('ReportUser', { contact: { ...profile, id: personId, name } })}><Text style={s.safetyText}>Report</Text></TouchableOpacity><TouchableOpacity style={s.safetyButton} onPress={() => Alert.alert('Block account?', `Block ${name} from starting direct conversations with you?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onPress: async () => { try { await blockKonnektUser(personId); Alert.alert('Blocked', 'This account is now blocked.'); navigation.goBack(); } catch (error) { setNotice(error.message); } } }])}><Text style={s.safetyText}>Block</Text></TouchableOpacity><TouchableOpacity style={s.safetyButton} onPress={() => navigation.navigate('BlockedContacts')}><Text style={s.safetyText}>Block list</Text></TouchableOpacity></View>}
    <View style={s.infoCard}><Text style={s.sectionTitle}>About</Text><Text style={s.bio}>{profile.bio || 'This member has not added a bio yet.'}</Text></View>
    {busy && <ActivityIndicator color="#168BFF" style={{ marginTop: 16 }}/>} {!!notice && <Text style={s.notice}>{notice}</Text>}
    <Text style={s.footer}>KONNEKT · Connecting people everywhere.</Text>
  </ScrollView>;
}
const s=StyleSheet.create({container:{flex:1,backgroundColor:'#07111F'},content:{padding:18,paddingBottom:35},back:{color:'#168BFF',fontSize:16,marginTop:12,marginBottom:18},profileSection:{backgroundColor:'#14243A',borderRadius:18,padding:22,alignItems:'center'},avatar:{width:92,height:92,borderRadius:46,backgroundColor:'#1C3B5A',alignItems:'center',justifyContent:'center'},avatarImage:{width:92,height:92,borderRadius:46},avatarText:{color:'#FFF',fontSize:35,fontWeight:'bold'},name:{fontSize:22,fontWeight:'bold',color:'#FFF',marginTop:14},username:{color:'#8CCBFF',fontSize:14,marginTop:5},memberStatus:{color:'#8293A8',fontSize:11,marginTop:8},stats:{flexDirection:'row',justifyContent:'space-around',width:'100%',marginTop:22},stat:{alignItems:'center'},statNum:{color:'#FFF',fontSize:18,fontWeight:'bold'},statLabel:{color:'#8293A8',fontSize:10,marginTop:3},actionRow:{flexDirection:'row',gap:10,marginTop:15},safetyRow:{flexDirection:'row',gap:8,marginTop:14},safetyButton:{flex:1,borderWidth:1,borderColor:'#65404B',padding:10,borderRadius:10,alignItems:'center'},safetyText:{color:'#FF9CA8',fontWeight:'bold',fontSize:11},followButton:{flex:1,backgroundColor:'#168BFF',padding:14,borderRadius:11,alignItems:'center'},followingButton:{backgroundColor:'#263A53',borderWidth:1,borderColor:'#54708E'},followText:{color:'#FFF',fontWeight:'bold'},messageButton:{flex:1,borderWidth:1,borderColor:'#168BFF',padding:14,borderRadius:11,alignItems:'center'},messageText:{color:'#8CCBFF',fontWeight:'bold'},infoCard:{backgroundColor:'#14243A',borderRadius:14,padding:18,marginTop:15},sectionTitle:{color:'#FFF',fontWeight:'bold',fontSize:15},bio:{color:'#C2D1E1',lineHeight:21,marginTop:9},notice:{color:'#FFB6C0',marginTop:14},footer:{color:'#65788F',textAlign:'center',marginTop:25,fontSize:11}});
