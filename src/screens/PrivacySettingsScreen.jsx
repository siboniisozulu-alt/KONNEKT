
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';

const privacyOptions = [
  {
    key: 'lastSeen',
    title: 'Last seen',
    subtitle: 'Control who can see when you were last active.',
    choices: ['Everyone', 'My Contacts', 'Nobody'],
  },
  {
    key: 'onlineStatus',
    title: 'Online status',
    subtitle: 'Control who can see when you are online.',
    choices: ['Everyone', 'Same as Last Seen'],
  },
  {
    key: 'profilePhoto',
    title: 'Profile photo',
    subtitle: 'Choose who can view your profile picture.',
    choices: ['Everyone', 'My Contacts', 'Nobody'],
  },
  {
    key: 'about',
    title: 'About',
    subtitle: 'Control who can see your profile description.',
    choices: ['Everyone', 'My Contacts', 'Nobody'],
  },
  {
    key: 'status',
    title: 'Status updates',
    subtitle: 'Choose who can see your status updates.',
    choices: ['My Contacts', 'My Contacts Except', 'Only Share With'],
  },
];

export default function PrivacySettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    lastSeen: 'My Contacts',
    onlineStatus: 'Same as Last Seen',
    profilePhoto: 'My Contacts',
    about: 'Everyone',
    status: 'My Contacts',
  });

  const [readReceipts, setReadReceipts] = useState(true);
  const [groupInvites, setGroupInvites] = useState('My Contacts');
  const [blockedCount, setBlockedCount] = useState(3);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const choosePrivacy = (option) => {
    Alert.alert(
      option.title,
      'Who should be able to see this information?',
      option.choices.map((choice) => ({
        text:
          settings[option.key] === choice
            ? `✓ ${choice}`
            : choice,
        onPress: () => updateSetting(option.key, choice),
      })).concat([
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ])
    );
  };

  const chooseGroupPrivacy = () => {
    Alert.alert(
      'Group invitations',
      'Who can add you to groups?',
      [
        {
          text: 'Everyone',
          onPress: () => setGroupInvites('Everyone'),
        },
        {
          text: 'My Contacts',
          onPress: () => setGroupInvites('My Contacts'),
        },
        {
          text: 'My Contacts Except',
          onPress: () => setGroupInvites('My Contacts Except'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
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
          <Text style={styles.headerTitle}>Privacy settings</Text>
          <Text style={styles.headerSubtitle}>
            Control your KONNEKT privacy
          </Text>
        </View>

        <Text style={styles.headerIcon}>🔒</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>WHO CAN SEE MY INFORMATION</Text>

        <View style={styles.settingsCard}>
          {privacyOptions.map((option, index) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.settingRow,
                index !== privacyOptions.length - 1 &&
                  styles.borderBottom,
              ]}
              onPress={() => choosePrivacy(option)}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  {option.title}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {option.subtitle}
                </Text>
                <Text style={styles.settingValue}>
                  {settings[option.key]}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>MESSAGING PRIVACY</Text>

        <View style={styles.settingsCard}>
          <View style={styles.switchRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Read receipts</Text>
              <Text style={styles.settingSubtitle}>
                Let people know when you have read their messages.
              </Text>
            </View>

            <Switch
              value={readReceipts}
              onValueChange={setReadReceipts}
              trackColor={{ false: '#D0D5DD', true: '#8CCFC0' }}
              thumbColor={readReceipts ? '#075E54' : '#FFFFFF'}
            />
          </View>

          <TouchableOpacity
            style={[styles.settingRow, styles.borderTop]}
            onPress={chooseGroupPrivacy}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                Group invitations
              </Text>
              <Text style={styles.settingSubtitle}>
                Choose who can add you to groups.
              </Text>
              <Text style={styles.settingValue}>
                {groupInvites}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT SAFETY</Text>

        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() =>
              navigation.navigate('BlockedContacts')
            }
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                Blocked contacts
              </Text>
              <Text style={styles.settingSubtitle}>
                Manage people you have blocked.
              </Text>
            </View>

            <View style={styles.blockedRight}>
              <Text style={styles.blockedCount}>
                {blockedCount}
              </Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🛡️</Text>
          <Text style={styles.infoText}>
            Your privacy matters. These settings are currently saved
            only on this screen. Backend integration will be required
            to enforce them across KONNEKT.
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
    padding: 15,
    paddingBottom: 30,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  settingSubtitle: {
    color: '#98A2B3',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  settingValue: {
    color: '#075E54',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 7,
  },
  arrow: {
    color: '#98A2B3',
    fontSize: 25,
    marginLeft: 10,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F2',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#EEF0F2',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  blockedRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockedCount: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#EAF2F1',
    padding: 14,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  infoIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    color: '#526B67',
    fontSize: 10,
    lineHeight: 16,
  },
});
