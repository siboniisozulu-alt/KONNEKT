
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

export default function ChatNotificationSettingsScreen({
  navigation,
  route,
}) {
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
  };

  const [messageNotifications, setMessageNotifications] =
    useState(true);

  const [groupNotifications, setGroupNotifications] =
    useState(true);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [vibrationEnabled, setVibrationEnabled] =
    useState(true);

  const [showPreview, setShowPreview] = useState(true);

  const [mentionNotifications, setMentionNotifications] =
    useState(true);

  const [callNotifications, setCallNotifications] =
    useState(true);

  const showInfo = () => {
    Alert.alert(
      'KONNEKT notifications',
      'These preferences are not connected to account storage yet. Changes on this screen will not be saved.'
    );
  };

  const SettingItem = ({
    icon,
    title,
    description,
    value,
    onChange,
  }) => (
    <View style={styles.settingItem}>
      <Text style={styles.icon}>{icon}</Text>

      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: '#D0D5DD',
          true: '#66BFA9',
        }}
        thumbColor={value ? '#075E54' : '#FFFFFF'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>
            Notification settings
          </Text>
          <Text style={styles.headerSubtitle}>
            {contact.name}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Choose how KONNEKT alerts you about activity in this
          conversation.
        </Text>

        <Text style={styles.sectionTitle}>
          MESSAGE NOTIFICATIONS
        </Text>

        <SettingItem
          icon="💬"
          title="Message notifications"
          description="Receive alerts for new messages"
          value={messageNotifications}
          onChange={setMessageNotifications}
        />

        <SettingItem
          icon="🔔"
          title="Mention notifications"
          description="Receive alerts when someone mentions you"
          value={mentionNotifications}
          onChange={setMentionNotifications}
        />

        <SettingItem
          icon="👥"
          title="Group notifications"
          description="Receive group activity alerts"
          value={groupNotifications}
          onChange={setGroupNotifications}
        />

        <Text style={styles.sectionTitle}>
          CALL NOTIFICATIONS
        </Text>

        <SettingItem
          icon="📞"
          title="Call notifications"
          description="Receive incoming voice and video call alerts"
          value={callNotifications}
          onChange={setCallNotifications}
        />

        <Text style={styles.sectionTitle}>
          ALERT PREFERENCES
        </Text>

        <SettingItem
          icon="🎵"
          title="Notification sound"
          description="Play a sound when an alert arrives"
          value={soundEnabled}
          onChange={setSoundEnabled}
        />

        <SettingItem
          icon="📳"
          title="Vibration"
          description="Vibrate when receiving notifications"
          value={vibrationEnabled}
          onChange={setVibrationEnabled}
        />

        <SettingItem
          icon="👁️"
          title="Message preview"
          description="Show message content in notifications"
          value={showPreview}
          onChange={setShowPreview}
        />

        <TouchableOpacity
          style={styles.infoButton}
          onPress={showInfo}
        >
          <Text style={styles.infoButtonText}>
            About notification settings
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            KONNEKT — Your conversations, your control.
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
  back: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 17,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 12,
    marginTop: 3,
  },
  content: {
    paddingBottom: 30,
  },
  intro: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
    padding: 17,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 17,
    marginBottom: 7,
    marginHorizontal: 17,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  icon: {
    fontSize: 21,
    width: 38,
  },
  settingText: {
    flex: 1,
    paddingRight: 8,
  },
  settingTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  infoButton: {
    marginHorizontal: 17,
    marginTop: 24,
    padding: 15,
    backgroundColor: '#E5F4EC',
    borderRadius: 10,
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#075E54',
    fontWeight: 'bold',
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    color: '#98A2B3',
    fontSize: 11,
    textAlign: 'center',
  },
});
