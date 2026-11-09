import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { ensureKonnektIdentity, getKonnektIdentityFingerprint } from '../services/konnektEncryption';

export default function IdentityVerificationScreen({ navigation, route }) {
  const { user } = useAuth();
  const contact = route?.params?.contact || {};
  const [ownFingerprint, setOwnFingerprint] = useState('');
  const [otherFingerprint, setOtherFingerprint] = useState('');
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');
  useEffect(() => { let live = true; (async () => { try {
    if (!user?.id || !contact.id) throw new Error('A signed-in account and contact are required.');
    const own = await ensureKonnektIdentity(user.id);
    const { data: other, error } = await supabase.from('profiles').select('encryption_public_key').eq('id', contact.id).maybeSingle();
    if (error) throw error;
    if (!other?.encryption_public_key) throw new Error('This contact has not registered an encryption identity yet. Ask them to open KONNEKT and try again.');
    const remoteJwk = JSON.parse(other.encryption_public_key);
    const [mine, theirs] = await Promise.all([getKonnektIdentityFingerprint(own.publicJwk), getKonnektIdentityFingerprint(remoteJwk)]);
    if (live) { setOwnFingerprint(mine); setOtherFingerprint(theirs); }
  } catch (error) { if (live) setNotice(error.message || 'Could not load identity fingerprints.'); }
  finally { if (live) setBusy(false); } })(); return () => { live = false; }; }, [user?.id, contact.id]);
  return <ScrollView style={s.page} contentContainerStyle={s.content}><TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>‹ Back</Text></TouchableOpacity><Text style={s.title}>Verify encryption identity</Text><Text style={s.body}>Compare these fingerprints with the other person using a trusted separate channel, such as an in-person check or a call you know is genuine. If either fingerprint differs, do not treat the conversation as identity-verified.</Text>{busy ? <ActivityIndicator color="#168BFF"/> : <><View style={s.card}><Text style={s.label}>Your fingerprint</Text><Text selectable style={s.code}>{ownFingerprint || 'Unavailable'}</Text></View><View style={s.card}><Text style={s.label}>{contact.full_name || contact.username || 'Contact'} fingerprint</Text><Text selectable style={s.code}>{otherFingerprint || 'Unavailable'}</Text></View></>}{!!notice && <Text style={s.notice}>{notice}</Text>}<Text style={s.warning}>KONNEKT displays fingerprints but does not automatically certify a person's real-world identity. You must compare them with your contact. A changed key should be re-verified.</Text></ScrollView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#07111F'},content:{padding:20,paddingBottom:40},back:{color:'#168BFF',fontSize:17,marginTop:18,marginBottom:18},title:{color:'#FFF',fontSize:24,fontWeight:'bold',marginBottom:12},body:{color:'#AFC0D4',lineHeight:21,marginBottom:20},card:{backgroundColor:'#14243A',borderRadius:13,padding:16,marginBottom:12},label:{color:'#8CCBFF',fontSize:12,fontWeight:'bold',marginBottom:10},code:{color:'#FFF',fontSize:17,fontWeight:'bold',letterSpacing:1},notice:{color:'#FFB6C0',lineHeight:20,marginTop:10},warning:{color:'#FFCF85',lineHeight:19,fontSize:12,marginTop:18}});
