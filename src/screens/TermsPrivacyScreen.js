
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const legalSections = [
  {
    id: 'terms',
    icon: '📜',
    title: 'Terms of Service',
    content:
      'By using KONNEKT, users agree to use the platform responsibly and follow its rules. Users are responsible for the content they create, upload and share. Do not use KONNEKT for scams, harassment, threats, impersonation or illegal activities. KONNEKT may restrict accounts that violate its policies, subject to applicable law and its final published terms.',
  },
  {
    id: 'privacy',
    icon: '🔒',
    title: 'Privacy Policy',
    content:
      'KONNEKT is designed to protect user privacy. A final privacy policy must explain what personal information is collected, why it is collected, how it is used, who it is shared with, how long it is stored and how users can exercise their privacy rights. Phone numbers, contacts, messages, location and media must only be handled according to clear disclosures, permissions and applicable privacy laws.',
  },
  {
    id: 'community',
    icon: '🤝',
    title: 'Community Guidelines',
    content:
      'Treat other users with respect. Do not post abusive, threatening, hateful, deceptive or exploitative content. Do not share another person’s private information without permission. Creators and live stream hosts must follow safety rules. Users should report harmful content and suspicious accounts.',
  },
  {
    id: 'copyright',
    icon: '©️',
    title: 'Copyright and content',
    content:
      'Only upload content you own or have permission to use. Do not copy or distribute copyrighted videos, music, images or other material without the necessary rights. A complete KONNEKT copyright policy must explain how rights holders can submit complaints and how disputes are handled.',
  },
  {
    id: 'safety',
    icon: '🛡️',
    title: 'Safety and reporting',
    content:
      'Users should be able to block accounts, report harmful content and manage who can contact them. A working reporting process must be connected to a moderation team and a documented review procedure. Serious threats and illegal activity should be handled through appropriate lawful channels.',
  },
  {
    id: 'payments',
    icon: '💰',
    title: 'Payments and creator earnings',
    content:
      'Any creator earnings, gifts, subscriptions, advertising revenue or promotional rewards must have clear eligibility rules, funding sources, fees, payment conditions and withdrawal requirements. Downloads or installations alone do not guarantee income or a payout. Earnings must not be promised unless they are supported by real available funds and valid programme terms.',
  },
];

export default function TermsPrivacyScreen({ navigation }) {
  const [expanded, setExpanded] = useState(null);
  const [accepted, setAccepted] = useState(false);

  const toggleSection = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleAcceptance = () => {
    Alert.alert(
      'Demonstration only',
      'Your selection has not been recorded as legal acceptance. KONNEKT needs approved final legal documents and a secure acceptance record before this can be used.'
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
            Terms & Privacy
          </Text>
          <Text style={styles.headerSubtitle}>
            Your rights and responsibilities
          </Text>
        </View>

        <Text style={styles.headerIcon}>📄</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>💚</Text>
          <Text style={styles.introTitle}>
            Trust matters at KONNEKT
          </Text>
          <Text style={styles.introText}>
            We want users to understand their rights, privacy and
            responsibilities when using the platform.
          </Text>
        </View>

        <Text style={styles.sectionHeading}>
          LEGAL INFORMATION
        </Text>

        {legalSections.map((section) => (
          <View key={section.id} style={styles.legalCard}>
            <TouchableOpacity
              style={styles.legalHeader}
              onPress={() => toggleSection(section.id)}
            >
              <Text style={styles.legalIcon}>
                {section.icon}
              </Text>

              <Text style={styles.legalTitle}>
                {section.title}
              </Text>

              <Text style={styles.expandIcon}>
                {expanded === section.id ? '−' : '+'}
              </Text>
            </TouchableOpacity>

            {expanded === section.id && (
              <View style={styles.legalContent}>
                <Text style={styles.legalText}>
                  {section.content}
                </Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.importantCard}>
          <Text style={styles.importantTitle}>
            Important notice
          </Text>
          <Text style={styles.importantText}>
            These are draft policy summaries for development purposes.
            They are not final legal agreements. Before public launch,
            KONNEKT must have complete, legally reviewed policies that
            comply with applicable laws, including South Africa's
            Protection of Personal Information Act (POPIA), where applicable.
          </Text>
        </View>

        <View style={styles.acceptCard}>
          <TouchableOpacity
            style={styles.acceptRow}
            onPress={() => setAccepted(!accepted)}
          >
            <View
              style={[
                styles.checkbox,
                accepted && styles.checkboxActive,
              ]}
            >
              {accepted && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>

            <Text style={styles.acceptText}>
              I have reviewed the draft information above.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.acceptButton,
              !accepted && styles.disabledButton,
            ]}
            disabled={!accepted}
            onPress={handleAcceptance}
          >
            <Text style={styles.acceptButtonText}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          KONNEKT · Legal information under development
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
    fontSize: 22,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  introCard: {
    backgroundColor: '#075E54',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 23,
  },
  introIcon: {
    fontSize: 38,
    marginBottom: 9,
  },
  introTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  introText: {
    color: '#D5EAE7',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  sectionHeading: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    overflow: 'hidden',
  },
  legalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  legalIcon: {
    fontSize: 21,
    marginRight: 12,
  },
  legalTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  expandIcon: {
    color: '#075E54',
    fontSize: 22,
    fontWeight: 'bold',
  },
  legalContent: {
    backgroundColor: '#F7F9FA',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  legalText: {
    color: '#526B67',
    fontSize: 11,
    lineHeight: 19,
  },
  importantCard: {
    backgroundColor: '#FFF4E5',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  importantTitle: {
    color: '#9A5B00',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  importantText: {
    color: '#805000',
    fontSize: 11,
    lineHeight: 19,
  },
  acceptCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  acceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#98A2B3',
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  acceptText: {
    color: '#526B67',
    fontSize: 11,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#075E54',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#AABAB6',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    color: '#98A2B3',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
  },
});
