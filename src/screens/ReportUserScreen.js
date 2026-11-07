
import React, { useState } from 'react';
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
  'Spam or unwanted advertising',
  'Harassment or bullying',
  'Fake account or impersonation',
  'Scams or fraud',
  'Inappropriate content',
  'Violence or threats',
  'Hate speech',
  'Other',
];

export default function ReportUserScreen({ navigation, route }) {
  const reportedUser = route?.params?.contact || {
    name: 'KONNEKT User',
  };

  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [includeMessages, setIncludeMessages] = useState(false);

  const submitReport = () => {
    if (!selectedReason) {
      Alert.alert(
        'Choose a reason',
        'Please select why you are reporting this account.'
      );
      return;
    }

    Alert.alert(
      'Report ready',
      `Account: ${reportedUser.name}\nReason: ${selectedReason}\n\nThis is a demo. Your report has not been sent to KONNEKT.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
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
          <Text style={styles.headerTitle}>Report account</Text>
          <Text style={styles.headerSubtitle}>
            Help keep KONNEKT safe
          </Text>
        </View>

        <Text style={styles.headerIcon}>🛡️</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {reportedUser.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View>
            <Text style={styles.userName}>{reportedUser.name}</Text>
            <Text style={styles.userLabel}>Account being reported</Text>
          </View>
        </View>

        <Text style={styles.heading}>Why are you reporting this account?</Text>

        <Text style={styles.description}>
          Select the reason that best describes the problem.
        </Text>

        <View style={styles.reasonsContainer}>
          {reportReasons.map((reason) => {
            const selected = selectedReason === reason;

            return (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonRow,
                  selected && styles.selectedReason,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    selected && styles.selectedReasonText,
                  ]}
                >
                  {reason}
                </Text>

                <View
                  style={[
                    styles.radio,
                    selected && styles.radioSelected,
                  ]}
                >
                  {selected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.heading}>Additional information</Text>

        <TextInput
          style={styles.textArea}
          placeholder="Explain what happened (optional)..."
          placeholderTextColor="#98A2B3"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
          maxLength={1000}
        />

        <Text style={styles.characterCount}>
          {description.length}/1000
        </Text>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setIncludeMessages(!includeMessages)}
        >
          <View
            style={[
              styles.checkbox,
              includeMessages && styles.checkboxSelected,
            ]}
          >
            {includeMessages && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>

          <Text style={styles.checkboxText}>
            Include relevant messages with this report
          </Text>
        </TouchableOpacity>

        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>ℹ️</Text>
          <Text style={styles.warningText}>
            Only submit truthful reports. KONNEKT moderators should
            review reports fairly and protect user privacy.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitReport}
        >
          <Text style={styles.submitButtonText}>Submit report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    fontSize: 24,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#D9EEE9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#075E54',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userLabel: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 4,
  },
  heading: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 7,
    marginTop: 10,
  },
  description: {
    color: '#667085',
    fontSize: 11,
    marginBottom: 12,
  },
  reasonsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  selectedReason: {
    backgroundColor: '#F0F8F6',
  },
  reasonText: {
    flex: 1,
    color: '#475467',
    fontSize: 12,
  },
  selectedReasonText: {
    color: '#075E54',
    fontWeight: 'bold',
  },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#B8C2CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#075E54',
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#075E54',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    padding: 13,
    minHeight: 105,
    color: '#17202A',
    fontSize: 12,
  },
  characterCount: {
    color: '#98A2B3',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 5,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 15,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor: '#B8C2CC',
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  checkboxText: {
    color: '#475467',
    fontSize: 11,
    flex: 1,
  },
  warningBox: {
    backgroundColor: '#EAF2F1',
    padding: 13,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 17,
    marginRight: 9,
  },
  warningText: {
    flex: 1,
    color: '#526B67',
    fontSize: 10,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#C0392B',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 5,
  },
  cancelButtonText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
