import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const sections = [
  {
    title: 'Messaging and contacts',
    description: 'Private conversations, groups, message tools and contact discovery.',
    items: [
      ['New message', 'NewChat', 'Start a private conversation'],
      ['Contacts', 'Contacts', 'Find KONNEKT members'],
      ['Create a group', 'CreateGroup', 'Set up a group conversation'],
      ['Group calling', 'Chats', 'Open a group conversation to start a voice or video call'],
    ],
  },
  {
    title: 'Social network',
    description: 'Discover people, publish content and manage your community.',
    items: [
      ['Discover people', 'Discover', 'Search and explore members'],
      ['Reels feed', 'Watch', 'Watch and publish short videos'],
      ['Status updates', 'Status', 'View 24-hour updates'],
      ['Create a status', 'CreateStatus', 'Share a photo, video or text update'],
      ['Followers', 'Followers', 'View your followers'],
      ['Following', 'Following', 'View accounts you follow'],
    ],
  },
  {
    title: 'Live and creator tools',
    description: 'Creator workspace, live sessions, analytics and monetisation tools.',
    items: [
      ['Creator studio', 'CreatorStudio', 'Open creator tools and published content'],
      ['My content', 'CreatorContentManagement', 'Manage your published posts'],
      ['Live rooms', 'LiveStreamSetup', 'Create or join a room; video broadcasting needs a configured provider'],
      ['Creator analytics', 'CreatorAnalytics', 'Review creator performance'],
      ['Creator monetisation', 'CreatorMonetization', 'Explore monetisation settings'],
      ['Creator earnings', 'CreatorEarnings', 'View earnings screen'],
      ['Creator subscriptions', 'CreatorSubscriptions', 'Manage subscription options'],
      ['Creator verification', 'CreatorVerification', 'Open verification application'],
      ['Brand partnerships', 'CreatorBrandPartnerships', 'Explore partnership tools'],
    ],
  },
  {
    title: 'Account and security',
    description: 'Protect your account, manage sessions and control privacy.',
    items: [
      ['Account settings', 'AccountSettings', 'Manage account preferences'],
      ['Privacy settings', 'PrivacySettings', 'Manage privacy controls'],
      ['Change password', 'ChangePassword', 'Update your account password'],
      ['Two-step verification', 'TwoStepVerification', 'Set up an additional sign-in check'],
      ['Active sessions', 'ActiveSessions', 'Review signed-in devices'],
      ['Blocked contacts', 'BlockedContacts', 'Manage blocked accounts'],
      ['Encryption key recovery', 'KeyRecovery', 'Back up or restore your encryption key'],
      ['Terms and privacy', 'TermsPrivacy', 'Read platform terms and privacy information'],
    ],
  },
  {
    title: 'Notifications and safety',
    description: 'Stay informed and access community protection tools.',
    items: [
      ['Notifications', 'Notifications', 'View your activity notifications'],
      ['Notification settings', 'NotificationSettings', 'Manage notification preferences'],
      ['Content preferences', 'ContentPreferences', 'Adjust content preferences'],
      ['Moderation centre', 'AdminModeration', 'Restricted to authorised moderators'],
    ],
  },
  {
    title: 'Language and accessibility',
    description: 'Save your language and accessibility preferences on this device.',
    items: [
      ['Language & accessibility', 'PlatformPreferences', 'Choose a language, larger text, contrast and motion preferences'],
    ],
  },
];

export default function FeatureHubScreen({ navigation }) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button">
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <Text style={styles.brand}>KONNEKT</Text>
      <Text style={styles.title}>All features</Text>
      <Text style={styles.intro}>Open KONNEKT features and account tools. Some capabilities require device permissions or service configuration before they can be enabled.</Text>
      {sections.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionDescription}>{section.description}</Text>
          {section.items.map(([label, route, detail, params]) => (
            <TouchableOpacity key={`${route}-${label}`} style={styles.item} onPress={() => navigation.navigate(route, params || {})} accessibilityRole="button" accessibilityLabel={`Open ${label}`}>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{label}</Text>
                <Text style={styles.itemDetail}>{detail}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <View style={styles.note}>
        <Text style={styles.noteTitle}>Account and service availability</Text>
        <Text style={styles.noteText}>Each feature requires its listed permissions and service configuration. Unconfigured integrations remain unavailable until the required setup is complete.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#10091B' },
  content: { padding: 18, paddingBottom: 42 },
  back: { alignSelf: 'flex-start', paddingVertical: 9, paddingHorizontal: 4 },
  backText: { color: '#D8B8F5', fontSize: 16, fontWeight: '700' },
  brand: { color: '#55B5FF', letterSpacing: 3, fontSize: 11, fontWeight: '800', marginTop: 12 },
  title: { color: '#FFF', fontSize: 29, fontWeight: '800', marginTop: 5 },
  intro: { color: '#A9B8CB', fontSize: 13, lineHeight: 20, marginTop: 10, marginBottom: 18 },
  section: { backgroundColor: '#101D30', borderColor: '#233A56', borderWidth: 1, borderRadius: 15, padding: 14, marginBottom: 14 },
  sectionTitle: { color: '#EAF5FF', fontSize: 17, fontWeight: '800' },
  sectionDescription: { color: '#8FA5BF', fontSize: 11, lineHeight: 16, marginTop: 4, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopColor: '#233A56', borderTopWidth: 1, minHeight: 54 },
  itemCopy: { flex: 1, paddingRight: 10 },
  itemTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  itemDetail: { color: '#8FA5BF', fontSize: 10, marginTop: 3 },
  arrow: { color: '#35A4FF', fontSize: 25, paddingHorizontal: 6 },
  note: { backgroundColor: '#171D2B', borderRadius: 12, borderWidth: 1, borderColor: '#4B426D', padding: 14, marginTop: 4 },
  noteTitle: { color: '#D9C8FF', fontWeight: '800', marginBottom: 5 },
  noteText: { color: '#B9B4C8', fontSize: 11, lineHeight: 17 },
});
