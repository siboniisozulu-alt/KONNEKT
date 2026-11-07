
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

export default function PhoneVerificationScreen({ navigation, route }) {
  const [verificationCode, setVerificationCode] = useState('');

  const phoneNumber = route?.params?.phoneNumber || '';

  const handleVerification = () => {
    if (verificationCode.length !== 6) {
      Alert.alert(
        'Invalid code',
        'Please enter the six-digit verification code.'
      );
      return;
    }

    Alert.alert(
      'Verification demo',
      'The screen is ready. Real SMS verification will be connected later.'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>KONNEKT</Text>

        <Text style={styles.icon}>🔐</Text>

        <Text style={styles.title}>Verify your number</Text>

        <Text style={styles.description}>
          Enter the six-digit verification code sent to:
        </Text>

        <Text style={styles.phone}>{phoneNumber}</Text>

        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          placeholderTextColor="#888"
          keyboardType="number-pad"
          maxLength={6}
          value={verificationCode}
          onChangeText={setVerificationCode}
          textAlign="center"
        />

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerification}
        >
          <Text style={styles.verifyButtonText}>
            VERIFY NUMBER
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Resend code',
              'SMS code delivery will be connected later.'
            )
          }
        >
          <Text style={styles.resendText}>
            Didn't receive a code? Resend
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Change phone number</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
    justifyContent: 'center',
    padding: 24
  },
  content: {
    alignItems: 'center',
    width: '100%'
  },
  logo: {
    color: '#00E5A8',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 35
  },
  icon: {
    fontSize: 55,
    marginBottom: 20
  },
  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 12
  },
  description: {
    color: '#B8C4D4',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8
  },
  phone: {
    color: '#00E5A8',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 25
  },
  codeInput: {
    width: '100%',
    height: 60,
    backgroundColor: '#14243A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00E5A8',
    color: '#FFFFFF',
    fontSize: 25,
    letterSpacing: 10,
    marginBottom: 25
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#00E5A8',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center'
  },
  verifyButtonText: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: 'bold'
  },
  resendText: {
    color: '#00E5A8',
    marginTop: 25,
    fontSize: 14
  },
  backText: {
    color: '#B8C4D4',
    marginTop: 25,
    fontSize: 14
  }
});
