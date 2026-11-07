
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+27');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    if (
      !fullName.trim() ||
      !username.trim() ||
      !phoneNumber.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Missing information', 'Please complete all fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        'Weak password',
        'Your password must contain at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password error', 'Your passwords do not match.');
      return;
    }

    if (phoneNumber.replace(/\D/g, '').length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }

    navigation.navigate('PhoneVerification', {
      phoneNumber,
      fullName,
      username
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>KONNEKT</Text>

        <Text style={styles.title}>Create your account</Text>

        <Text style={styles.subtitle}>
          Join the people, conversations and creativity.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#8A99AD"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="Choose a username"
          placeholderTextColor="#8A99AD"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="+27 Phone number"
          placeholderTextColor="#8A99AD"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Create password"
          placeholderTextColor="#8A99AD"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#8A99AD"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
        >
          <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F'
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  logo: {
    color: '#00E5A8',
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 35
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    color: '#B8C4D4',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 14
  },
  input: {
    backgroundColor: '#14243A',
    borderWidth: 1,
    borderColor: '#263A53',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#00E5A8',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loginText: {
    color: '#00E5A8',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 14
  }
});
