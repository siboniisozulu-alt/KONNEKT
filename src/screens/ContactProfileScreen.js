
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function ContactProfileScreen({ navigation, route }) {
  const contact = route?.params?.contact || {
    id: 'demo',
    name: 'KONNEKT User',
    username: '@konnektuser',
    phone: '+27',
    initials: 'KU',
    bio: 'Connecting with people on KONNEKT.',
    onKonnekt: true,
  };

  const startChat = () => {
    navigation.navigate('ChatConversation', {
      contact,
    });
  };

  const startCall = () => {
    Alert.alert(
      'Voice Call',
      'Voice calling will be connected in a future update.'
    );
  };

  const openMoreOptions = () => {
    Alert.alert(
      'Contact Options',
      'More contact options will be available in a future update.'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Contact Profile</Text>

        <TouchableOpacity onPress={openMoreOptions}>
          <Text style={styles.moreButton}>•••</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.initials ||
              (contact.name || 'K').charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>
          {contact.name || 'KONNEKT User'}
        </Text>

        <Text style={styles.username}>
          {contact.username || '@user'}
        </Text>

        <Text style={styles.memberStatus}>
          {contact.onKonnekt === false
            ? 'Not yet on KONNEKT'
            : 'KONNEKT Member'}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={startChat}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={startCall}
        >
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>
          {contact.bio || 'No bio added yet.'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.infoLabel}>Phone number</Text>
        <Text style={styles.infoValue}>
          {contact.phone || 'Not available'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.infoLabel}>Username</Text>
        <Text style={styles.infoValue}>
          {contact.username || 'Not available'}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Shared Activity</Text>

        <Text style={styles.activityText}>
          Shared photos, videos, messages and other activity
          will appear here when this feature is connected.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.blockButton}
        onPress={() =>
          Alert.alert(
            'Block Contact',
            'Contact blocking and reporting will be implemented with account security.'
          )
        }
      >
        <Text style={styles.blockButtonText}>
          Block or Report Contact
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Contact information is displayed according to account
        privacy settings.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    color: '#075E54',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#17202A',
    fontSize: 17,
    fontWeight: 'bold',
  },
  moreButton: {
    color: '#075E54',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D5F5E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#075E54',
    fontSize: 35,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#17202A',
    marginTop: 15,
  },
  username: {
    color: '#075E54',
    fontSize: 14,
    marginTop: 5,
  },
  memberStatus: {
    color: '#667085',
    fontSize: 12,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 18,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 23,
  },
  actionText: {
    color: '#075E54',
    fontWeight: 'bold',
    marginTop: 7,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 12,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#17202A',
    marginBottom: 12,
  },
  bio: {
    color: '#475467',
    fontSize: 14,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 14,
  },
  infoLabel: {
    color: '#667085',
    fontSize: 12,
  },
  infoValue: {
    color: '#17202A',
    fontSize: 14,
    marginTop: 5,
  },
  activityText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
  },
  blockButton: {
    marginHorizontal: 16,
    backgroundColor: '#FCE8E6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  blockButtonText: {
    color: '#B42318',
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#667085',
    fontSize: 11,
    padding: 18,
  },
});
