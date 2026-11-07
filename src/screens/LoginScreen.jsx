
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [countryCode, setCountryCode] = useState('+27');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleLogin = () => {
    const cleanedNumber = phoneNumber.replace(/\s/g, '');

    if (!cleanedNumber || cleanedNumber.length < 9) {
      Alert.alert(
        'Invalid phone number',
        'Please enter a valid registered phone number.'
      );
      return;
    }

    navigation.navigate('PhoneVerification', {
      phoneNumber: `${countryCode}${cleanedNumber}`,
      purpose: 'login',
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>K</Text>
          <Text style={styles.brand}>KONNEKT</Text>
        </View>

        <Text style={styles.title}>Welcome Back!</Text>

        <Text style={styles.description}>
          Log in using the phone number registered
          with your KONNEKT account.
        </Text>

        <Text style={styles.label}>Phone number</Text>

        <View style={styles.phoneContainer}>
          <TextInput
            style={styles.countryCode}
            value={countryCode}
            onChangeText={setCountryCode}
            keyboardType="phone-pad"
            maxLength={4}
          />

          <TextInput
            style={styles.phoneInput}
            placeholder="Enter phone number"
            placeholderTextColor="#8293A8"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>
            CONTINUE
          </Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don't have an account?
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signupLink}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.security}>
          Your account and personal information
          are protected by KONNEKT.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071426',
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },

  backButton: {
    marginBottom: 35,
  },

  backText: {
    color: '#55B5FF',
    fontSize: 16,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#168BFF',
    color: '#FFFFFF',
    fontSize: 45,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
  },

  brand: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginTop: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  description: {
    color: '#B7C8DC',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 35,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },

  phoneContainer: {
    flexDirection: 'row',
    backgroundColor: '#102640',
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 25,
  },

  countryCode: {
    color: '#FFFFFF',
    fontSize: 16,
    width: 65,
    paddingVertical: 17,
    borderRightWidth: 1,
    borderRightColor: '#35506C',
  },

  phoneInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 17,
  },

  loginButton: {
    backgroundColor: '#168BFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    gap: 6,
  },

  signupText: {
    color: '#B7C8DC',
    fontSize: 14,
  },

  signupLink: {
    color: '#55B5FF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  security: {
    color: '#657A92',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
  },
});
