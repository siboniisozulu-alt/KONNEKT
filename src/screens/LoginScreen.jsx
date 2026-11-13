import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../lib_supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');


const login = async () => {
  setError('');

  if (!email.trim() || !password) {
    return setError('Enter your email address and password.');
  }

  setBusy(true);

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    navigation.replace('Reels');
  } catch (err) {
    setError(err.message || 'Login failed. Please try again.');
  } finally {
    setBusy(false);
  }
};

  const resetPassword = async () => {
    if (!email.trim()) return setError('Enter your email address first.');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin + window.location.pathname });
    setError(resetError ? resetError.message : 'Password reset email sent. Check your inbox.');
  };

  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Back</Text></TouchableOpacity>
    <Text style={styles.logo}>KONNEKT</Text>
    <Text style={styles.title}>Welcome back</Text>
    <Text style={styles.sub}>Log in with your email and password.</Text>
    <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#BBA9CC" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
    <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#BBA9CC" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
    {!!error && <Text style={styles.error}>{error}</Text>}
    <TouchableOpacity style={styles.button} onPress={login} disabled={busy}>{busy ? <ActivityIndicator color="#10091B" /> : <Text style={styles.buttonText}>LOG IN</Text>}</TouchableOpacity>
    <TouchableOpacity onPress={resetPassword}><Text style={styles.link}>Forgot password?</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}><Text style={styles.link}>Create a new account</Text></TouchableOpacity>
    <Text style={styles.note}>Email authentication is provided by Supabase. Phone/SMS verification is not required for this first release.</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', backgroundColor: '#10091B', padding: 25 },
  back: { color: '#00E6FF', fontSize: 16, marginBottom: 30 },
  logo: { color: '#6A0DAD', fontSize: 30, fontWeight: 'bold', letterSpacing: 3, textAlign: 'center', marginBottom: 35 },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  sub: { color: '#B8C4D4', marginBottom: 25 },
  input: { backgroundColor: '#241630', borderColor: '#39244B', borderWidth: 1, borderRadius: 12, padding: 16, color: '#FFF', marginBottom: 14, fontSize: 15 },
  button: { backgroundColor: '#FF6B00', padding: 17, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  link: { color: '#00E6FF', textAlign: 'center', marginTop: 22, fontWeight: '600' },
  error: { color: '#FF8795', marginBottom: 12 },
  note: { color: '#A5A0B4', fontSize: 12, textAlign: 'center', marginTop: 28, lineHeight: 18 }
});
