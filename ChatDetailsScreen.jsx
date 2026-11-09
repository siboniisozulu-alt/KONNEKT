
import React, { useState } from 'react';
import { blockKonnektUser } from '../services/safety';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';

export default function ChatDetailsScreen({ navigation, route }) {
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
    username: '@konnekt_user',
    phone: '+27',
  };

  const [muted, setMuted] = useState(false);
  const [savedMedia, setSavedMedia] = useState(true);
  const [disappearingMessages, setDisappearingMessages] =
    useState(false);

  const showDemoMessage = (feature) => {
    Alert.alert(
      feature,
      'This feature will be connected to the KONNEKT backend during integration.'
    );
  };

  const DetailRow = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
    >
      <Text style={styles.rowIcon}>{icon}</Text>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const SettingRow = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
  }) => (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D0D5DD', true: '#66BFA9' }}
        thumbColor={value ? '#075E54' : '#FFFFFF'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chat details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {contact.name?.charAt(0)?.toUpperCase() || 'K'}
            </Text>
          </View>

          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.username}>
            {contact.username || '@konnekt_user'}
          </Text>
          <Text style={styles.phone}>
            {contact.phone || 'Phone number unavailable'}
          </Text>

          <View style={styles.profileButtons}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() =>
                navigation.navigate('ContactProfile', { contact })
              }
            >
              <Text style={styles.profileButtonIcon}>👤</Text>
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => showDemoMessage('Voice call')}
            >
              <Text style={styles.profileButtonIcon}>📞</Text>
              <Text style={styles.profileButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => showDemoMessage('Video call')}
            >
              <Text style={styles.profileButtonIcon}>🎥</Text>
              <Text style={styles.profileButtonText}>Video</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Shared content</Text>

        <DetailRow
          icon="🖼️"
          title="Media, links and documents"
          subtitle="View everything shared in this chat"
          onPress={() =>
            navigation.navigate('ChatMedia', { contact })
          }
        />

        <DetailRow
          icon="🔍"
          title="Search conversation"
          subtitle="Find messages in this chat"
          onPress={() => showDemoMessage('Search conversation')}
        />

        <Text style={styles.sectionTitle}>Chat settings</Text>

        <SettingRow
          icon="🔕"
          title="Mute notifications"
          subtitle="Stop notifications from this chat"
          value={muted}
          onValueChange={setMuted}
        />

        <SettingRow
          icon="💾"
          title="Save received media"
          subtitle="Save media to your device"
          value={savedMedia}
          onValueChange={setSavedMedia}
        />

        <SettingRow
          icon="⏳"
          title="Disappearing messages"
          subtitle="Demo setting — expiry options will be added"
          value={disappearingMessages}
          onValueChange={setDisappearingMessages}
        />

        <Text style={styles.sectionTitle}>Privacy and safety</Text>

        <DetailRow
          icon="🚫"
          title="Block contact"
          subtitle="Stop this person from contacting you"
          onPress={() => Alert.alert('Block contact?', `Stop ${contact.name || 'this member'} from starting direct chats with you?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onPress: async () => { try { await blockKonnektUser(contact.id); Alert.alert('Blocked', 'This account has been added to your blocked list.'); } catch (error) { Alert.alert('Could not block account', error.message); } } }])}
        />

        <DetailRow
          icon="⚠️"
          title="Report contact"
          subtitle="Report inappropriate behaviour"
          onPress={() => navigation.navigate('ReportUser', { contact })}
        />

        <DetailRow
          icon="🗑️"
          title="Clear conversation"
          subtitle="Remove messages from this device"
          onPress={() =>
            Alert.alert(
              'Clear conversation',
              'This demo does not delete messages. Backend deletion controls will be added later.',
              [{ text: 'OK' }]
            )
          }
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            KONNEKT — Stay connected.
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
    paddingHorizontal: 16,
    paddingVertical: 17,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 18,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 24,
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: 'bold',
  },
  contactName: {
    color: '#17202A',
    fontSize: 21,
    fontWeight: 'bold',
  },
  username: {
    color: '#667085',
    fontSize: 13,
    marginTop: 5,
  },
  phone: {
    color: '#667085',
    fontSize: 12,
    marginTop: 5,
  },
  profileButtons: {
    flexDirection: 'row',
    marginTop: 22,
  },
  profileButton: {
    alignItems: 'center',
    marginHorizontal: 17,
  },
  profileButtonIcon: {
    fontSize: 23,
    marginBottom: 5,
  },
  profileButtonText: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 17,
    textTransform: 'uppercase',
  },
  row: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  rowIcon: {
    fontSize: 21,
    width: 38,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: '#667085',
    fontSize: 11,
    marginTop: 4,
  },
  arrow: {
    color: '#98A2B3',
    fontSize: 24,
  },
  footer: {
    alignItems: 'center',
    padding: 25,
  },
  footerText: {
    color: '#98A2B3',
    fontSize: 11,
  },
});
