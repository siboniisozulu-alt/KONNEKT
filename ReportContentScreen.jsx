
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { submitKonnektReport } from '../services/safety';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

const reportReasons = [
  'Spam or misleading content',
  'Harassment or bullying',
  'Hate speech',
  'Violence or dangerous behaviour',
  'Nudity or sexual content',
  'Scam or fraud',
  'Copyright violation',
  'Child safety concern',
  'Other',
];

export default function ReportContentScreen({ navigation, route }) {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');

  const contentType = route?.params?.contentType || 'Content';
  const contentId = route?.params?.contentId || null;
  const creatorName = route?.params?.creatorName || 'Unknown creator';

  const submitReport = async () => {
    if (!selectedReason) { Alert.alert('Select a reason', 'Please choose why you are reporting this content.'); return; }
    if (selectedReason === 'Other' && !details.trim()) { Alert.alert('More information needed', 'Please explain the reason for your report.'); return; }
    setSending(true);
    try {
      const type = ['post','comment','message'].includes(String(contentType).toLowerCase()) ? String(contentType).toLowerCase() : 'other';
      await submitKonnektReport({ reportedUserId: route?.params?.reportedUserId || null, contentId, contentType: type, reason: selectedReason, details });
      Alert.alert('Report submitted', 'Thank you. Your report has been securely submitted for moderator review.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) { Alert.alert('Could not submit report', error.message || 'Please try again.'); }
    finally { setSending(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Report content</Text>

        <Text style={styles.headerIcon}>🚩</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🛡️</Text>
          <Text style={styles.introTitle}>
            Help keep KONNEKT safe
          </Text>
          <Text style={styles.introText}>
            Tell us what is wrong with this content. Reports should
            be honest and submitted in good faith.
          </Text>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.label}>CONTENT INFORMATION</Text>

          <Text style={styles.infoText}>
            Type: {contentType}
          </Text>

          <Text style={styles.infoText}>
            Creator: {creatorName}
          </Text>

          {contentId && (
            <Text style={styles.infoText}>
              Content reference: {contentId}
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          WHY ARE YOU REPORTING THIS?
        </Text>

        <View style={styles.reasonsCard}>
          {reportReasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.reasonRow}
              onPress={() => setSelectedReason(reason)}
            >
              <View style={styles.radioOuter}>
                {selectedReason === reason && (
                  <View style={styles.radioInner} />
                )}
              </View>

              <Text style={styles.reasonText}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          ADDITIONAL DETAILS (OPTIONAL)
        </Text>

        <TextInput
          style={styles.detailsInput}
          placeholder="Explain what happened..."
          placeholderTextColor="#98A2B3"
          multiline
          textAlignVertical="top"
          maxLength={1000}
          value={details}
          onChangeText={setDetails}
        />

        <Text style={styles.characterCount}>
          {details.length}/1000 characters
        </Text>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>
            Important
          </Text>
          <Text style={styles.warningText}>
            Do not use reporting to target or harass other users.
            If someone is in immediate danger, contact the appropriate
            emergency services.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitReport}
        >
          <Text style={styles.submitButtonText}>
            Submit report
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          KONNEKT Safety Centre · Reporting interface demonstration
        </Text>
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
  headerIcon: {
    fontSize: 22,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  introCard: {
    backgroundColor: '#E8F4F1',
    borderRadius: 14,
    padding: 19,
    alignItems: 'center',
    marginBottom: 20,
  },
  introIcon: {
    fontSize: 38,
    marginBottom: 9,
  },
  introTitle: {
    color: '#075E54',
    fontSize: 15,
    fontWeight: 'bold',
  },
  introText: {
    color: '#526B67',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 11,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  label: {
    color: '#98A2B3',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  infoText: {
    color: '#526B67',
    fontSize: 11,
    marginTop: 5,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
  },
  reasonsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    marginBottom: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  radioOuter: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#075E54',
  },
  reasonText: {
    color: '#17202A',
    fontSize: 11,
    flex: 1,
  },
  detailsInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 11,
    minHeight: 110,
    padding: 13,
    color: '#17202A',
    fontSize: 12,
  },
  characterCount: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'right',
    marginTop: 6,
  },
  warningCard: {
    backgroundColor: '#FFF4E5',
    borderRadius: 11,
    padding: 14,
    marginTop: 20,
  },
  warningTitle: {
    color: '#9A5B00',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  warningText: {
    color: '#805000',
    fontSize: 11,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#D92D20',
    padding: 16,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 22,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 18,
  },
});
