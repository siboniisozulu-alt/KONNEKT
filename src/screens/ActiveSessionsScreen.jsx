
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const initialSessions = [
  {
    id: '1',
    device: 'This device',
    model: 'Android phone',
    location: 'Current session',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: '2',
    device: 'Other Android device',
    model: 'Android',
    location: 'Unknown location',
    lastActive: 'Yesterday',
    current: false,
  },
];

export default function ActiveSessionsScreen({ navigation }) {
  const [sessions, setSessions] = useState(initialSessions);

  const signOutSession = (id) => {
    Alert.alert(
      'Sign out device?',
      'Are you sure you want to remove this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            setSessions((previous) =>
              previous.filter((session) => session.id !== id)
            );

            Alert.alert(
              'Demo action',
              'The session was removed from this demonstration screen. A real server must revoke the device login.'
            );
          },
        },
      ]
    );
  };

  const signOutOtherDevices = () => {
    Alert.alert(
      'Sign out other devices?',
      'This will remove all other sessions from this demonstration screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setSessions((previous) =>
              previous.filter((session) => session.current)
            );

            Alert.alert(
              'Demo action',
              'Other sessions were removed locally. Real account sessions must be revoked by the KONNEKT backend.'
            );
          },
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

        <Text style={styles.headerTitle}>Active sessions</Text>
        <Text style={styles.headerIcon}>📱</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🛡️</Text>
          <Text style={styles.introTitle}>
            Keep your account secure
          </Text>
          <Text style={styles.introText}>
            Review devices connected to your KONNEKT account. Sign out
            of devices you no longer use or do not recognise.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>YOUR DEVICES</Text>
          <Text style={styles.count}>
            {sessions.length} sessions
          </Text>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>
              No active sessions
            </Text>
            <Text style={styles.emptyText}>
              Your device sessions will appear here.
            </Text>
          </View>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.deviceIcon}>
                <Text style={styles.deviceEmoji}>📱</Text>
              </View>

              <View style={styles.sessionInfo}>
                <View style={styles.deviceTitleRow}>
                  <Text style={styles.deviceName}>
                    {session.device}
                  </Text>

                  {session.current && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentText}>
                        CURRENT
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.deviceModel}>
                  {session.model}
                </Text>

                <Text style={styles.location}>
                  📍 {session.location}
                </Text>

                <Text style={styles.lastActive}>
                  {session.lastActive}
                </Text>

                {!session.current && (
                  <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={() => signOutSession(session.id)}
                  >
                    <Text style={styles.signOutText}>
                      Sign out this device
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {sessions.some((session) => !session.current) && (
          <TouchableOpacity
            style={styles.allButton}
            onPress={signOutOtherDevices}
          >
            <Text style={styles.allButtonText}>
              Sign out all other devices
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>
            Important security advice
          </Text>
          <Text style={styles.warningText}>
            • Never share your login verification code.
          </Text>
          <Text style={styles.warningText}>
            • Sign out of devices you do not recognise.
          </Text>
          <Text style={styles.warningText}>
            • Contact KONNEKT support if you suspect unauthorised access.
          </Text>
        </View>

        <Text style={styles.demoNote}>
          Demonstration only: device sessions are sample data.
          Real session tracking and remote sign-out require backend
          authentication and server-side token revocation.
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
    fontSize: 17,
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
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 25,
  },
  introIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  introTitle: {
    color: '#075E54',
    fontSize: 16,
    fontWeight: 'bold',
  },
  introText: {
    color: '#526B67',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
  },
  count: {
    color: '#075E54',
    fontSize: 11,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EAF2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceEmoji: {
    fontSize: 25,
  },
  sessionInfo: {
    flex: 1,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  deviceName: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  currentBadge: {
    backgroundColor: '#DDF4E7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 7,
  },
  currentText: {
    color: '#16834A',
    fontSize: 8,
    fontWeight: 'bold',
  },
  deviceModel: {
    color: '#667085',
    fontSize: 11,
    marginTop: 5,
  },
  location: {
    color: '#667085',
    fontSize: 10,
    marginTop: 7,
  },
  lastActive: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 5,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D92D20',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  signOutText: {
    color: '#D92D20',
    fontSize: 10,
    fontWeight: 'bold',
  },
  allButton: {
    backgroundColor: '#D92D20',
    padding: 15,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 8,
  },
  allButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 13,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 35,
  },
  emptyTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptyText: {
    color: '#667085',
    fontSize: 11,
    marginTop: 6,
  },
  warningCard: {
    backgroundColor: '#FFF4E5',
    padding: 15,
    borderRadius: 12,
    marginTop: 22,
  },
  warningTitle: {
    color: '#9A5B00',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  warningText: {
    color: '#805000',
    fontSize: 11,
    lineHeight: 19,
  },
  demoNote: {
    color: '#98A2B3',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 18,
  },
});
