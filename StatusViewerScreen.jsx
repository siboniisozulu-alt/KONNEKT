import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
export default function StatusViewerScreen({ navigation, route }) {
  const item = route?.params?.status;
  if (!item) return <View style={s.root}><Text style={s.text}>This status is no longer available.</Text><TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>Go back</Text></TouchableOpacity></View>;
  const name = item.profile?.full_name || (item.profile?.username ? `@${item.profile.username}` : 'KONNEKT member');
  return <View style={s.root}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={s.close}><Text style={s.back}>‹ Close</Text></TouchableOpacity>
    <View style={s.progress}><View style={s.progressFill}/></View>
    <Text style={s.name}>{name}</Text>
    <Text style={s.created}>{new Date(item.created_at).toLocaleString()}</Text>
    <View style={s.mediaBox}>{item.media_url ? (item.media_type === 'image' ? <Image source={{ uri: item.media_url }} style={s.media} resizeMode="contain"/> : <video src={item.media_url} controls autoPlay playsInline style={{ width:'100%', height:'100%', objectFit:'contain', backgroundColor:'#000' }}/>) : <Text style={s.text}>{item.text_content || 'Shared a moment'}</Text>}</View>
    {!!item.media_url && !!item.text_content && <Text style={s.caption}>{item.text_content}</Text>}
    <Text style={s.time}>Expires {new Date(item.expires_at).toLocaleString()}</Text>
  </View>;
}
const s=StyleSheet.create({root:{flex:1,minHeight:0,backgroundColor:'#07111F',padding:18},close:{marginTop:15},back:{color:'#168BFF',fontSize:16},progress:{height:3,backgroundColor:'#263A53',borderRadius:3,marginTop:18,marginBottom:20},progressFill:{height:3,width:'100%',backgroundColor:'#168BFF',borderRadius:3},name:{color:'#FFF',fontSize:20,fontWeight:'bold'},created:{color:'#8293A8',fontSize:11,marginTop:4},mediaBox:{flex:1,minHeight:200,marginTop:18,backgroundColor:'#000',borderRadius:14,overflow:'hidden',alignItems:'center',justifyContent:'center'},media:{width:'100%',height:'100%'},text:{color:'#FFF',fontSize:22,textAlign:'center',padding:24},caption:{color:'#FFF',fontSize:16,textAlign:'center',marginTop:14},time:{color:'#8293A8',textAlign:'center',marginTop:14,fontSize:11}});
