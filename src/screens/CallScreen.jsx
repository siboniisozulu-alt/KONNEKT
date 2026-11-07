
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';

export default function CallScreen({ navigation, route }) {
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
    username: '@contact',
  };

  const callType = route?.params?.callType || 'voice';

  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(
    callType === 'video'
  );
  const [callStatus, setCallStatus] = useState('Connecting...');

  useEffect(() => {
    const statusTimer = setTimeout(() => {
      setCallStatus('Demo call');
    }, 2000);

    return () => clearTimeout(statusTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return (
      `${String(minutes).padStart(2, '0')}:` +
      `${String(remainingSeconds).padStart(2, '0')}`
    );
  };

  const endCall = () => {
    Alert.alert(
      'End call?',
      'Do you want to end this call?',
      [
        { text: 'Continue call', style: 'cancel' },
        {
          text: 'End call',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#062F2B" />

      <View style={styles.topSection}>
        <Text style={styles.callType}>
          {callType === 'video' ? 'VIDEO CALL' : 'VOICE CALL'}
        </Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.contactName}>{contact.name}</Text>

        <Text style={styles.username}>
          {contact.username || ''}
        </Text>

        <Text style={styles.callStatus}>{callStatus}</Text>

        <Text style={styles.callTimer}>
          {formatTime(seconds)}
        </Text>

        {callType === 'video' && (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoIcon}>
              {cameraEnabled ? '📹' : '📷'}
            </Text>
            <Text style={styles.videoText}>
              Camera preview will appear here when video calling
              is connected.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controlsSection}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              muted && styles.activeControl,
            ]}
            onPress={() => setMuted(!muted)}
          >
            <Text style={styles.controlIcon}>
              {muted ? '🔇' : '🎤'}
            </Text>
            <Text style={styles.controlLabel}>
              {muted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              speaker && styles.activeControl,
            ]}
            onPress={() => setSpeaker(!speaker)}
          >
            <Text style={styles.controlIcon}>🔊</Text>
            <Text style={styles.controlLabel}>Speaker</Text>
          </TouchableOpacity>

          {callType === 'video' && (
            <TouchableOpacity
              style={[
                styles.controlButton,
                !cameraEnabled && styles.activeControl,
              ]}
              onPress={() =>
                setCameraEnabled(!cameraEnabled)
              }
            >
              <Text style={styles.controlIcon}>
                {cameraEnabled ? '📹' : '📷'}
              </Text>
              <Text style={styles.controlLabel}>Camera</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.endCallButton}
          onPress={endCall}
        >
          <Text style={styles.endCallIcon}>☎</Text>
        </TouchableOpacity>

        <Text style={styles.endCallLabel}>End call</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#062F2B',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  callType: {
    color: '#A7D7CB',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 35,
  },
  avatar: {
    width: 115,
    height: 115,
    borderRadius: 58,
    backgroundColor: '#D5F5E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#075E54',
    fontSize: 48,
    fontWeight: 'bold',
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 22,
  },
  username: {
    color: '#A7D7CB',
    fontSize: 13,
    marginTop: 5,
  },
  callStatus: {
    color: '#C7E6DE',
    fontSize: 13,
    marginTop: 25,
  },
  callTimer: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 8,
  },
  videoPlaceholder: {
    backgroundColor: '#164C44',
    borderRadius: 15,
    width: '100%',
    minHeight: 115,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 25,
  },
  videoIcon: {
    fontSize: 28,
  },
  videoText: {
    color: '#D5EAE7',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 8,
  },
  controlsSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 35,
  },
  controlButton: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#164C44',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  activeControl: {
    backgroundColor: '#39766B',
  },
  controlIcon: {
    fontSize: 24,
  },
  controlLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 5,
  },
  endCallButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    transform: [{ rotate: '135deg' }],
  },
  endCallLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 10,
  },
});
