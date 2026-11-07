
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';

export default function CreatorVerificationScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [profileConfirmed, setProfileConfirmed] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const submitApplication = () => {
    if (!fullName.trim() || !username.trim() || !reason.trim()) {
      Alert.alert('Missing information', 'Please complete all fields.');
      return;
    }

    if (!identityConfirmed || !profileConfirmed) {
      Alert.alert(
        'Checklist incomplete',
        'Please confirm both checklist items before continuing.'
      );
      return;
    }

    Alert.alert(
      'Demo application',
      'Your sample verification application will be recorded on this screen only. No identity documents have been submitted or reviewed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => setApplicationSubmitted(true),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Creator Verification</Text>
        <Text style={styles.headerIcon}>✓</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.badgeIcon}>🔵</Text>
        <Text style={styles.heroTitle}>Get verified on KONNEKT</Text>
        <Text style={styles.heroDescription}>
          Verification will help audiences identify authentic
          creator accounts and protect the community.
        </Text>
        <Text style={styles.demoLabel}>VERIFICATION PREVIEW</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Why get verified?</Text>

        <Text style={styles.infoLine}>
          ✓ Help audiences recognise your authentic profile.
        </Text>
        <Text style={styles.infoLine}>
          ✓ Build trust with followers and potential partners.
        </Text>
        <Text style={styles.infoLine}>
          ✓ Reduce confusion with impersonator accounts.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Application details</Text>

        <Text style={styles.label}>Full legal name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#98A2B3"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>KONNEKT username</Text>
        <TextInput
          style={styles.input}
          placeholder="@username"
          placeholderTextColor="#98A2B3"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Why should your account be verified?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about your creator work..."
          placeholderTextColor="#98A2B3"
          value={reason}
          onChangeText={setReason}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.sectionTitle}>Verification checklist</Text>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setIdentityConfirmed(!identityConfirmed)}
        >
          <Text style={styles.checkbox}>
            {identityConfirmed ? '☑' : '☐'}
          </Text>
          <Text style={styles.checkText}>
            I confirm that the information I provide is accurate.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setProfileConfirmed(!profileConfirmed)}
        >
          <Text style={styles.checkbox}>
            {profileConfirmed ? '☑' : '☐'}
          </Text>
          <Text style={styles.checkText}>
            I understand that verification does not guarantee
            popularity, earnings or special treatment.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            applicationSubmitted && styles.submittedButton,
          ]}
          onPress={submitApplication}
          disabled={applicationSubmitted}
        >
          <Text style={styles.submitText}>
            {applicationSubmitted
              ? 'DEMO APPLICATION RECORDED'
              : 'SUBMIT VERIFICATION APPLICATION'}
          </Text>
        </TouchableOpacity>

        {applicationSubmitted && (
          <View style={styles.statusBox}>
            <Text style={styles.statusTitle}>
              Application status: Demo submitted
            </Text>
            <Text style={styles.statusDescription}>
              This status is stored locally and is not a real
              verification review.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>🔒 Protect your identity</Text>
        <Text style={styles.warningText}>
          Never send identity documents or passwords to people
          claiming they can sell you a verified badge.
        </Text>
        <Text style={styles.warningText}>
          A real verification process must use a secure,
          official KONNEKT service with clear privacy rules.
        </Text>
      </View>

      <Text style={styles.footer}>
        Verification is not active yet. This prototype does not
        collect, store or verify identity documents.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  content: {
    paddingBottom: 35,
  },
  header: {
    backgroundColor: '#075E54',
    paddingTop: 43,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  hero: {
    backgroundColor: '#075E54',
    margin: 14,
    padding: 23,
    borderRadius: 13,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 45,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  heroDescription: {
    color: '#D1E7E3',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 9,
  },
  demoLabel: {
    backgroundColor: '#FFFFFF',
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 15,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoLine: {
    color: '#475467',
    fontSize: 10,
    lineHeight: 21,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 15,
    borderRadius: 10,
  },
  label: {
    color: '#344054',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 8,
    padding: 12,
    color: '#17202A',
    fontSize: 11,
  },
  textArea: {
    minHeight: 95,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
  },
  checkbox: {
    color: '#075E54',
    fontSize: 20,
    marginRight: 10,
  },
  checkText: {
    flex: 1,
    color: '#475467',
    fontSize: 10,
    lineHeight: 17,
    paddingTop: 3,
  },
  submitButton: {
    backgroundColor: '#075E54',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submittedButton: {
    backgroundColor: '#667085',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusBox: {
    backgroundColor: '#ECFDF3',
    padding: 12,
    borderRadius: 8,
    marginTop: 13,
  },
  statusTitle: {
    color: '#067647',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusDescription: {
    color: '#475467',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 5,
  },
  warningCard: {
    backgroundColor: '#FFF7E8',
    marginHorizontal: 14,
    padding: 15,
    borderRadius: 10,
  },
  warningTitle: {
    color: '#9A6700',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningText: {
    color: '#7A4F01',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 15,
    marginHorizontal: 20,
    marginTop: 15,
  },
});
