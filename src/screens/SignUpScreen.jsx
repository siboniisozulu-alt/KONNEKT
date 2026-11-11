import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../lib_supabase';

export default function SignUpScreen({ navigation }) {
  const [fullName,setFullName]=useState(''); const [username,setUsername]=useState(''); const [email,setEmail]=useState(''); const [phone,setPhone]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(''); const [error,setError]=useState('');
  const register=async()=>{
    setError('');setMessage('');
    if(!fullName.trim()||!username.trim()||!email.trim()||!password||!confirm) return setError('Complete your name, username, email and password fields.');
    if(!/^[a-zA-Z0-9_.]{3,20}$/.test(username.trim())) return setError('Username must be 3–20 characters and use letters, numbers, dots or underscores.');
    if(password.length<8) return setError('Use a password with at least 8 characters.');
    if(password!==confirm) return setError('The passwords do not match.');
    setBusy(true);
    const {data,error:signupError}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password,options:{emailRedirectTo:window.location.origin+window.location.pathname,data:{full_name:fullName.trim(),username:username.trim().toLowerCase(),phone:phone.trim()}}});
    setBusy(false);
    if(signupError) return setError(signupError.message);
    if(data.session) setMessage('Your account has been created. Welcome to KONNEKT!');
    else setMessage('Account created. Check your email and confirm your address before logging in.');
  };
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><TouchableOpacity onPress={()=>navigation.goBack()}><Text style={styles.back}>‹ Back</Text></TouchableOpacity><Text style={styles.logo}>KONNEKT</Text><Text style={styles.title}>Create your account</Text><Text style={styles.sub}>Join people, conversations and creativity worldwide.</Text>
    <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#BBA9CC" value={fullName} onChangeText={setFullName}/>
    <TextInput style={styles.input} placeholder="Username (3–20 characters)" placeholderTextColor="#BBA9CC" value={username} onChangeText={setUsername} autoCapitalize="none"/>
    <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#BBA9CC" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email"/>
    <TextInput style={styles.input} placeholder="Phone number (optional)" placeholderTextColor="#BBA9CC" value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
    <TextInput style={styles.input} placeholder="Create password (at least 8 characters)" placeholderTextColor="#BBA9CC" value={password} onChangeText={setPassword} secureTextEntry/>
    <TextInput style={styles.input} placeholder="Confirm password" placeholderTextColor="#BBA9CC" value={confirm} onChangeText={setConfirm} secureTextEntry/>
    {!!error&&<Text style={styles.error}>{error}</Text>}{!!message&&<Text style={styles.success}>{message}</Text>}
    <TouchableOpacity style={styles.button} onPress={register} disabled={busy}>{busy?<ActivityIndicator color="#10091B"/>:<Text style={styles.buttonText}>CREATE ACCOUNT</Text>}</TouchableOpacity>
    <TouchableOpacity onPress={()=>navigation.navigate('Login')}><Text style={styles.link}>Already registered? Log in</Text></TouchableOpacity><Text style={styles.note}>No SMS charges. Email confirmation may be required by your Supabase authentication settings.</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({page:{flexGrow:1,justifyContent:'center',backgroundColor:'#10091B',padding:24},back:{color:'#55B5FF',fontSize:16,marginBottom:22},logo:{color:'#6A0DAD',fontSize:30,fontWeight:'bold',letterSpacing:3,textAlign:'center',marginBottom:28},title:{color:'#FFF',fontSize:27,fontWeight:'bold',textAlign:'center',marginBottom:8},sub:{color:'#B8C4D4',textAlign:'center',marginBottom:25},input:{backgroundColor:'#241630',borderWidth:1,borderColor:'#39244B',borderRadius:12,padding:15,color:'#FFF',fontSize:15,marginBottom:12},button:{backgroundColor:'#6A0DAD',padding:17,borderRadius:12,alignItems:'center',marginTop:8},buttonText:{color:'#FFF',fontWeight:'bold'},link:{color:'#55B5FF',textAlign:'center',marginTop:22},error:{color:'#FF8795',marginBottom:10},success:{color:'#54D6A2',marginBottom:10,lineHeight:20},note:{color:'#71849B',fontSize:12,textAlign:'center',marginTop:22,lineHeight:18}});
