
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';

export default function TwoStepVerificationScreen({ navigation }) {
  const [enabled, setEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [email, setEmail] = useState('');

  const saveVerification = () => {
    if (!pin || pin.length !== 6) {
      Alert.alert(
        'Invalid PIN',
        'Please enter a six-digit security PIN.'
      );
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert(
        'PIN mismatch',
        'Your PIN entries do not match.'
      );
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert(
        'Invalid email',
        'Please enter a valid recovery email address.'
      );
      return;
    }

    Alert.alert(
      'Demo configuration',
      'Your PIN and email have been checked, but two-step verification is not activated on your account yet. Secure backend integration is required.'
    );
  };

  const disableVerification = () => {
    Alert.alert(
      'Turn off two-step verification?',
      'This demo will switch the setting off locally.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Turn off',
          style: 'destructive',
          onPress: () => {
            setEnabled(false);
            setPin('');
            setConfirmPin('');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Two-step verification
          </Text>
          <Text style={styles.headerSubtitle}>
            Add extra protection to your account
          </Text>
        </View>

        <Text style={styles.headerIcon}>🔐</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.securityIcon}>
          <Text style={styles.bigLock}>🔒</Text>
        </View>

        <Text style={styles.heading}>
          Protect your KONNEKT account
        </Text>

        <Text style={styles.intro}>
          Create a six-digit PIN that will be required during supported
          account verification and recovery processes.
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              Two-step verification
            </Text>
            <Text style={styles.statusSubtitle}>
              {enabled ? 'Enabled in this demo' : 'Not enabled'}
            </Text>
          </View>

          <Switch
            value={enabled}
            onValueChange={(value) => {
              if (value) {
                setEnabled(true);
              } else {
                disableVerification();
              }
            }}
            trackColor={{ false: '#D0D5DD', true: '#8CCFC0' }}
            thumbColor={enabled ? '#075E54' : '#FFFFFF'}
          />
        </View>

        {enabled && (
          <>
            <Text style={styles.sectionTitle}>CREATE YOUR PIN</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit PIN"
              placeholderTextColor="#98A2B3"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={pin}
              onChangeText={setPin}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm 6-digit PIN"
              placeholderTextColor="#98A2B3"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={confirmPin}
              onChangeText={setConfirmPin}
            />

            <Text style={styles.sectionTitle}>
              RECOVERY EMAIL
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter recovery email (optional)"
              placeholderTextColor="#98A2B3"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveVerification}
            >
              <Text style={styles.saveButtonText}>
                Save security settings
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Security tips</Text>

          <Text style={styles.infoText}>
            • Never share your security PIN with anyone.
          </Text>

          <Text style={styles.infoText}>
            • Use a recovery email you can access.
          </Text>

          <Text style={styles.infoText}>
            • Avoid using easily guessed PINs such as 123456.
          </Text>

          <Text style={styles.infoText}>
            • KONNEKT must store PINs securely using server-side
            password hashing, never as plain text.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  header: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  back: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 10,
    marginTop: 3,
  },
  headerIcon: {
    fontSize: 23,
  },
  content: {
    padding: 17,
    paddingBottom: 35,
  },
  securityIcon: {
    alignItems: 'center',
    marginTop: 20,
  },
  bigLock: {
    fontSize: 65,
  },
  heading: {
    color: '#17202A',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
  intro: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 9,
    marginBottom: 22,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusSubtitle: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 5,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 11,
    padding: 15,
    color: '#17202A',
    fontSize: 13,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#075E54',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#EAF2F1',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  infoTitle: {
    color: '#075E54',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#526B67',
    fontSize: 11,
    lineHeight: 19,
    marginBottom: 5,
  },
});
