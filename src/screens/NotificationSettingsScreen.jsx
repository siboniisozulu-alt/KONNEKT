
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';

const initialSettings = [
  { id: 'messages', title: 'Messages', description: 'New messages and group activity.', value: true },
  { id: 'calls', title: 'Calls', description: 'Incoming voice and video calls.', value: true },
  { id: 'social', title: 'Social activity', description: 'Follows, likes and comments.', value: true },
  { id: 'security', title: 'Security alerts', description: 'Important account and sign-in alerts.', value: true },
];

export default function NotificationSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(initialSettings);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [preview, setPreview] = useState(true);

  useEffect(() => {
    try { const saved = globalThis.localStorage?.getItem('konnekt-notification-preferences'); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed.settings)) setSettings(parsed.settings); if (typeof parsed.sound === 'boolean') setSound(parsed.sound); if (typeof parsed.vibration === 'boolean') setVibration(parsed.vibration); if (typeof parsed.preview === 'boolean') setPreview(parsed.preview); } } catch { /* Ignore malformed local preferences and use safe defaults. */ }
  }, []);

  const updateSetting = (id, value) => {
    setSettings((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, value } : item
      )
    );
  };

  const enableAll = () => {
    setSettings((previous) =>
      previous.map((item) => ({ ...item, value: true }))
    );
  };

  const disableNonEssential = () => {
    setSettings((previous) =>
      previous.map((item) => ({
        ...item,
        value: item.id === 'security',
      }))
    );
  };

  const saveSettings = () => {
    try {
      if (typeof globalThis.localStorage !== 'undefined') globalThis.localStorage.setItem('konnekt-notification-preferences', JSON.stringify({ settings, sound, vibration, preview }));
      Alert.alert('Settings saved', 'Your notification preferences have been saved on this device. Actual delivery still depends on device permissions and notification-service configuration.');
    } catch (error) { Alert.alert('Could not save settings', error.message || 'Please try again.'); }
  };

  const renderToggle = (title, description, value, onChange) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#D0D5DD', true: '#8CCFC0' }}
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

        <Text style={styles.headerTitle}>
          Notification settings
        </Text>

        <Text style={styles.headerIcon}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🔔</Text>
          <Text style={styles.introTitle}>
            Your notifications, your choice
          </Text>
          <Text style={styles.introDescription}>
            Choose what KONNEKT can notify you about.
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={enableAll}
          >
            <Text style={styles.quickButtonText}>
              Enable all
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={disableNonEssential}
          >
            <Text style={styles.quickButtonText}>
              Essential only
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          NOTIFICATION TYPES
        </Text>

        <View style={styles.card}>
          {settings.map((item, index) => (
            <View key={item.id}>
              {renderToggle(
                item.title,
                item.description,
                item.value,
                (value) => updateSetting(item.id, value)
              )}

              {index !== settings.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          NOTIFICATION BEHAVIOUR
        </Text>

        <View style={styles.card}>
          {renderToggle(
            'Notification sounds',
            'Play a sound when notifications arrive.',
            sound,
            setSound
          )}

          <View style={styles.divider} />

          {renderToggle(
            'Vibration',
            'Vibrate when notifications arrive.',
            vibration,
            setVibration
          )}

          <View style={styles.divider} />

          {renderToggle(
            'Message previews',
            'Show message text in notifications.',
            preview,
            setPreview
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Important security notifications
          </Text>
          <Text style={styles.infoText}>
            Account security alerts should remain enabled to help
            you notice suspicious login activity.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
        >
          <Text style={styles.saveButtonText}>
            Save notification settings
          </Text>
        </TouchableOpacity>

        <Text style={styles.demoNote}>
          These preferences are saved on this device. Background push notifications require notification-service configuration and device permission.
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
    fontSize: 16,
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
    padding: 20,
    alignItems: 'center',
    marginBottom: 17,
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
  introDescription: {
    color: '#526B67',
    fontSize: 11,
    marginTop: 7,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0E5DF',
    borderRadius: 9,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickButtonText: {
    color: '#075E54',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingDescription: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F4',
  },
  infoCard: {
    backgroundColor: '#FFF4E5',
    borderRadius: 11,
    padding: 14,
  },
  infoTitle: {
    color: '#9A5B00',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  infoText: {
    color: '#805000',
    fontSize: 11,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#075E54',
    padding: 16,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  demoNote: {
    color: '#98A2B3',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 15,
  },
});
