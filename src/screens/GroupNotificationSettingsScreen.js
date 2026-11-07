
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';

export default function GroupNotificationSettingsScreen({
  navigation,
  route,
}) {
  const group = route?.params?.group || {
    name: 'KONNEKT Friends',
  };

  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    messageNotifications: true,
    mentionNotifications: true,
    callNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    previewEnabled: true,
  });

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    if (route?.params?.onSave) {
      route.params.onSave(settings);
    }

    Alert.alert(
      'Settings updated',
      'Your notification preferences have been updated on this screen.'
    );
  };

  const renderSwitch = (title, description, key) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>
          {description}
        </Text>
      </View>

      <Switch
        value={settings[key]}
        onValueChange={(value) => updateSetting(key, value)}
        trackColor={{
          false: '#D0D5DD',
          true: '#75C99A',
        }}
        thumbColor={settings[key] ? '#075E54' : '#F4F4F4'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>
            Group notifications
          </Text>
          <Text style={styles.headerSubtitle}>
            {group.name}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Choose which group activities should send notifications
          to your device.
        </Text>

        <Text style={styles.sectionTitle}>MAIN SETTINGS</Text>

        {renderSwitch(
          'Allow notifications',
          'Turn all notifications from this group on or off.',
          'notificationsEnabled'
        )}

        <Text style={styles.sectionTitle}>NOTIFICATION TYPES</Text>

        <View
          style={
            !settings.notificationsEnabled && styles.disabledSection
          }
        >
          {renderSwitch(
            'New messages',
            'Receive alerts when members send messages.',
            'messageNotifications'
          )}

          {renderSwitch(
            'Mentions',
            'Receive alerts when someone mentions you.',
            'mentionNotifications'
          )}

          {renderSwitch(
            'Group calls',
            'Receive alerts for group voice and video calls.',
            'callNotifications'
          )}
        </View>

        <Text style={styles.sectionTitle}>ALERT STYLE</Text>

        <View
          style={
            !settings.notificationsEnabled && styles.disabledSection
          }
        >
          {renderSwitch(
            'Notification sound',
            'Play a sound when a notification arrives.',
            'soundEnabled'
          )}

          {renderSwitch(
            'Vibration',
            'Vibrate your phone when alerts arrive.',
            'vibrationEnabled'
          )}

          {renderSwitch(
            'Message previews',
            'Show message text in notifications.',
            'previewEnabled'
          )}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
        >
          <Text style={styles.saveButtonText}>
            Save settings
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          These preferences are currently stored locally in this
          screen. Device notification permissions and backend
          notification delivery still need to be connected.
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 15,
    paddingVertical: 17,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 12,
    marginTop: 3,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  intro: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 9,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F2',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingDescription: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  disabledSection: {
    opacity: 0.45,
  },
  saveButton: {
    backgroundColor: '#075E54',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  note: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 15,
  },
});
