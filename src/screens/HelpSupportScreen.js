
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

const helpTopics = [
  {
    id: '1',
    icon: '🔐',
    title: 'Account and login',
    description: 'Registration, login and account security.',
    answer:
      'Register using your phone number and follow the verification steps. Keep your login details private and enable additional security when available.',
  },
  {
    id: '2',
    icon: '💬',
    title: 'Messages and calls',
    description: 'Chats, voice notes, groups and calls.',
    answer:
      'KONNEKT is designed to support private chats, group conversations, media sharing and voice or video calls. Some features are still under development.',
  },
  {
    id: '3',
    icon: '📸',
    title: 'Statuses and stories',
    description: 'Create, view and manage statuses.',
    answer:
      'KONNEKT statuses are designed for sharing photos, videos and text updates with selected contacts. The planned default expiry is 24 hours.',
  },
  {
    id: '4',
    icon: '🎬',
    title: 'Videos and creators',
    description: 'Watch, upload and manage videos.',
    answer:
      'The Watch experience is designed for short videos, creator profiles, likes, comments and sharing. Real video hosting and recommendations require backend services.',
  },
  {
    id: '5',
    icon: '🔴',
    title: 'Live streaming',
    description: 'Hosting and watching live streams.',
    answer:
      'Live streaming is planned for creators and viewers. Reliable streaming, moderation and live interactions require connected streaming infrastructure.',
  },
  {
    id: '6',
    icon: '🛡️',
    title: 'Privacy and safety',
    description: 'Blocking, reporting and privacy settings.',
    answer:
      'Use available privacy controls to manage visibility and interactions. Reporting, blocking and enforcement must be connected to the KONNEKT backend to take effect.',
  },
];

export default function HelpSupportScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState('');

  const filteredTopics = helpTopics.filter((topic) =>
    `${topic.title} ${topic.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const contactSupport = () => {
    if (!message.trim()) {
      Alert.alert(
        'Message required',
        'Please describe the problem you need help with.'
      );
      return;
    }

    Alert.alert(
      'Support demonstration',
      'Your message has not been sent. KONNEKT needs a connected support service before messages can reach the support team.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>
            We're here to help
          </Text>
        </View>

        <Text style={styles.headerIcon}>❔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeIcon}>💚</Text>
          <Text style={styles.welcomeTitle}>
            Welcome to KONNEKT Support
          </Text>
          <Text style={styles.welcomeText}>
            Find answers, learn how to use KONNEKT and get help with
            your account.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          HOW CAN WE HELP?
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search help topics..."
            placeholderTextColor="#98A2B3"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.sectionTitle}>
          HELP TOPICS
        </Text>

        {filteredTopics.map((topic) => (
          <View key={topic.id} style={styles.topicCard}>
            <TouchableOpacity
              style={styles.topicHeader}
              onPress={() =>
                setExpandedId(
                  expandedId === topic.id ? null : topic.id
                )
              }
            >
              <Text style={styles.topicIcon}>{topic.icon}</Text>

              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>
                  {topic.title}
                </Text>
                <Text style={styles.topicDescription}>
                  {topic.description}
                </Text>
              </View>

              <Text style={styles.arrow}>
                {expandedId === topic.id ? '−' : '+'}
              </Text>
            </TouchableOpacity>

            {expandedId === topic.id && (
              <View style={styles.answerBox}>
                <Text style={styles.answerText}>
                  {topic.answer}
                </Text>
              </View>
            )}
          </View>
        ))}

        {filteredTopics.length === 0 && (
          <Text style={styles.noResults}>
            No matching help topics found.
          </Text>
        )}

        <View style={styles.contactCard}>
          <Text style={styles.contactIcon}>✉️</Text>
          <Text style={styles.contactTitle}>
            Still need help?
          </Text>
          <Text style={styles.contactDescription}>
            Describe your issue below. Once support is connected,
            users will be able to send requests to the KONNEKT team.
          </Text>

          <TextInput
            style={styles.messageInput}
            placeholder="Describe your problem..."
            placeholderTextColor="#98A2B3"
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={contactSupport}
          >
            <Text style={styles.sendButtonText}>
              Submit support request
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>
            KONNEKT safety reminder
          </Text>
          <Text style={styles.safetyText}>
            Never send your password, PIN or verification code to
            anyone claiming to be KONNEKT support.
          </Text>
        </View>

        <Text style={styles.version}>
          KONNEKT Help Centre · Support features in development
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
    fontSize: 23,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  welcomeCard: {
    backgroundColor: '#075E54',
    padding: 22,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  welcomeIcon: {
    fontSize: 38,
    marginBottom: 10,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeText: {
    color: '#D5EAE7',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  searchIcon: {
    fontSize: 17,
  },
  searchInput: {
    flex: 1,
    padding: 14,
    color: '#17202A',
    fontSize: 12,
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    overflow: 'hidden',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  topicIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  topicDescription: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 4,
  },
  arrow: {
    color: '#075E54',
    fontSize: 22,
    fontWeight: 'bold',
  },
  answerBox: {
    backgroundColor: '#F2F7F6',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  answerText: {
    color: '#526B67',
    fontSize: 11,
    lineHeight: 19,
  },
  noResults: {
    color: '#98A2B3',
    textAlign: 'center',
    padding: 20,
    fontSize: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 13,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  contactIcon: {
    fontSize: 30,
    textAlign: 'center',
  },
  contactTitle: {
    color: '#17202A',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  contactDescription: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 15,
  },
  messageInput: {
    backgroundColor: '#F7F9FA',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 10,
    minHeight: 105,
    padding: 12,
    color: '#17202A',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: '#075E54',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  safetyCard: {
    backgroundColor: '#FFF4E5',
    padding: 14,
    borderRadius: 11,
    marginTop: 18,
  },
  safetyTitle: {
    color: '#9A5B00',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  safetyText: {
    color: '#805000',
    fontSize: 11,
    lineHeight: 18,
  },
  version: {
    color: '#98A2B3',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
  },
});
