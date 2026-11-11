import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { submitKonnektReport } from '../services/safety';

const reasons = ['Spam or unwanted advertising', 'Harassment or bullying', 'Fake account or impersonation', 'Scams or fraud', 'Inappropriate content', 'Violence or threats', 'Hate speech', 'Other'];

export default function ReportUserScreen({ navigation, route }) {
  const contact = route?.params?.contact || {};
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const submit = async () => {
    if (!contact.id) return setNotice('This account could not be identified. Open the report form from the member profile.');
    if (!reason) return setNotice('Choose a reason for this report.');
    if (reason === 'Other' && !details.trim()) return setNotice('Please add details for this report.');
    setSaving(true); setNotice('');
    try { await submitKonnektReport({ reportedUserId: contact.id, contentType: 'user', reason, details }); Alert.alert('Report submitted', 'Your report was securely submitted for moderation review.', [{ text: 'OK', onPress: () => navigation.goBack() }]); }
    catch (e) { setNotice(e.message || 'The report could not be submitted. Please try again.'); }
    finally { setSaving(false); }
  };
  const name = contact.name || contact.full_name || contact.username || 'KONNEKT member';
  return <View style={s.page}><View style={s.header}><TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>‹</Text></TouchableOpacity><Text style={s.title}>Report account</Text></View><ScrollView contentContainerStyle={s.content}><Text style={s.member}>{name}</Text><Text style={s.sub}>Choose the reason that best describes the issue. Reports are visible only to you and authorised moderators.</Text>{reasons.map(x=><TouchableOpacity key={x} style={[s.reason,reason===x&&s.selected]} onPress={()=>setReason(x)}><Text style={s.reasonText}>{x}</Text><Text style={s.radio}>{reason===x?'●':'○'}</Text></TouchableOpacity>)}<TextInput style={s.details} value={details} onChangeText={setDetails} multiline maxLength={2000} placeholder="Additional details (optional)" placeholderTextColor="#BBA9CC"/><TouchableOpacity style={s.submit} disabled={saving} onPress={submit}>{saving?<ActivityIndicator color="#FFF"/>:<Text style={s.submitText}>Submit report</Text>}</TouchableOpacity>{!!notice&&<Text style={s.notice}>{notice}</Text>}</ScrollView></View>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#10091B'},header:{padding:18,paddingTop:24,flexDirection:'row',alignItems:'center',gap:18,borderBottomWidth:1,borderColor:'#39244B'},back:{color:'#D8B8F5',fontSize:30},title:{color:'#FFF',fontSize:21,fontWeight:'800'},content:{padding:18,paddingBottom:40},member:{color:'#FFF',fontSize:17,fontWeight:'700',marginBottom:7},sub:{color:'#C4B4D0',lineHeight:20,marginBottom:18},reason:{backgroundColor:'#241630',borderColor:'#39244B',borderWidth:1,borderRadius:11,padding:14,marginBottom:9,flexDirection:'row',justifyContent:'space-between'},selected:{borderColor:'#6A0DAD',backgroundColor:'#173456'},reasonText:{color:'#EAF5FF',flex:1},radio:{color:'#65B7FF',marginLeft:12},details:{minHeight:110,backgroundColor:'#241630',color:'#FFF',borderRadius:11,padding:14,textAlignVertical:'top',marginTop:8},submit:{backgroundColor:'#6A0DAD',padding:15,borderRadius:11,alignItems:'center',marginTop:16},submitText:{color:'#FFF',fontWeight:'800'},notice:{color:'#FFB6C0',marginTop:14,lineHeight:19}});
