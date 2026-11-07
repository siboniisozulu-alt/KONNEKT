
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const changePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        'Missing information',
        'Please complete all three password fields.'
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        'Weak password',
        'Your new password must contain at least 8 characters.'
      );
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert(
        'Choose another password',
        'Your new password must be different from your current password.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Passwords do not match',
        'Please make sure your new passwords match.'
      );
      return;
    }

    Alert.alert(
      'Password not changed',
      'Password updates are handled through your signed-in account. Use the account password recovery option if you cannot change it here.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Change password</Text>
        <Text style={styles.lock}>🔐</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.bigLock}>🔒</Text>
        </View>

        <Text style={styles.heading}>
          Update your password
        </Text>

        <Text style={styles.description}>
          Choose a strong password to help protect your KONNEKT account.
        </Text>

        <Text style={styles.label}>CURRENT PASSWORD</Text>

        <View style={styles.passwordBox}>
          <TextInput
            style={styles.input}
            placeholder="Enter current password"
            placeholderTextColor="#98A2B3"
            secureTextEntry={!showCurrent}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() => setShowCurrent(!showCurrent)}
          >
            <Text style={styles.showText}>
              {showCurrent ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>NEW PASSWORD</Text>

        <View style={styles.passwordBox}>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#98A2B3"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() => setShowNew(!showNew)}
          >
            <Text style={styles.showText}>
              {showNew ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>

        <View style={styles.passwordBox}>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#98A2B3"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() => setShowConfirm(!showConfirm)}
          >
            <Text style={styles.showText}>
              {showConfirm ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>
            Password safety tips
          </Text>

          <Text style={styles.tip}>
            ✓ Use at least 8 characters.
          </Text>

          <Text style={styles.tip}>
            ✓ Combine letters, numbers and symbols.
          </Text>

          <Text style={styles.tip}>
            ✓ Avoid using your name or phone number.
          </Text>

          <Text style={styles.tip}>
            ✓ Never share your password with anyone.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={changePassword}
        >
          <Text style={styles.saveButtonText}>
            Update password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => {
            Alert.alert(
              'Password recovery',
              'Password recovery will be available once KONNEKT phone verification and backend authentication are connected.'
            );
          }}
        >
          <Text style={styles.forgotText}>
            Forgot your current password?
          </Text>
        </TouchableOpacity>
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  lock: {
    fontSize: 22,
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  bigLock: {
    fontSize: 58,
  },
  heading: {
    color: '#17202A',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  description: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  label: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  passwordBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: '#17202A',
    fontSize: 13,
  },
  showText: {
    color: '#075E54',
    fontSize: 11,
    fontWeight: 'bold',
    padding: 8,
  },
  tipsCard: {
    backgroundColor: '#EAF2F1',
    padding: 15,
    borderRadius: 12,
    marginTop: 22,
  },
  tipsTitle: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tip: {
    color: '#526B67',
    fontSize: 11,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#075E54',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  forgotButton: {
    alignItems: 'center',
    padding: 16,
  },
  forgotText: {
    color: '#075E54',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
