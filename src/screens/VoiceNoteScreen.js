
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function VoiceNoteScreen({ navigation, route }) {
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
  };

  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setSeconds((previous) => previous + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [recording]);

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60);
    const remaining = value % 60;

    return (
      `${String(minutes).padStart(2, '0')}:` +
      `${String(remaining).padStart(2, '0')}`
    );
  };

  const startRecording = () => {
    setSeconds(0);
    setRecorded(false);
    setPlaying(false);
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);

    if (seconds === 0) {
      Alert.alert(
        'Recording too short',
        'Record a voice note before saving.'
      );
      return;
    }

    setRecorded(true);

    Alert.alert(
      'Demo recording',
      'The recording interface has stopped. Actual audio recording still needs to be connected.'
    );
  };

  const playRecording = () => {
    setPlaying(!playing);

    Alert.alert(
      'Audio preview',
      'Audio playback will be available when the recording service is connected.'
    );
  };

  const sendRecording = () => {
    if (!recorded) {
      Alert.alert(
        'No recording',
        'Please record a voice note first.'
      );
      return;
    }

    Alert.alert(
      'Voice note demo',
      `Your ${formatTime(seconds)} voice note is ready to send. Actual audio upload is not connected yet.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const deleteRecording = () => {
    setRecording(false);
    setRecorded(false);
    setPlaying(false);
    setSeconds(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Voice note</Text>
          <Text style={styles.headerSubtitle}>
            To {contact.name}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.microphoneCircle}>
          <Text style={styles.microphoneIcon}>🎙️</Text>
        </View>

        <Text style={styles.title}>
          {recording
            ? 'Recording your message'
            : recorded
              ? 'Voice note recorded'
              : 'Record a voice note'}
        </Text>

        <Text style={styles.description}>
          {recording
            ? 'Speak clearly into your microphone.'
            : 'Press the microphone button to begin.'}
        </Text>

        <Text style={styles.timer}>
          {formatTime(seconds)}
        </Text>

        <View style={styles.waveform}>
          {Array.from({ length: 25 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.waveBar,
                {
                  height:
                    recorded || recording
                      ? 10 + ((index * 17) % 35)
                      : 8 + ((index * 7) % 12),
                },
              ]}
            />
          ))}
        </View>

        {recorded && (
          <View style={styles.previewControls}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={playRecording}
            >
              <Text style={styles.previewButtonText}>
                {playing ? 'Pause preview' : 'Play preview'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={deleteRecording}
            >
              <Text style={styles.deleteButtonText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.recordButton,
            recording && styles.recordingButton,
          ]}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={styles.recordButtonIcon}>
            {recording ? '■' : '🎤'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.recordHint}>
          {recording ? 'Tap to stop' : 'Tap to record'}
        </Text>

        {recorded && (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendRecording}
          >
            <Text style={styles.sendButtonText}>
              Send voice note ➤
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  microphoneCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D5F5E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneIcon: {
    fontSize: 45,
  },
  title: {
    color: '#17202A',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
  },
  description: {
    color: '#667085',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  timer: {
    color: '#075E54',
    fontSize: 35,
    fontWeight: 'bold',
    marginTop: 30,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    marginTop: 20,
  },
  waveBar: {
    width: 4,
    borderRadius: 3,
    backgroundColor: '#36A477',
    marginHorizontal: 2,
  },
  previewControls: {
    flexDirection: 'row',
    marginTop: 20,
  },
  previewButton: {
    backgroundColor: '#E5F4EC',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  previewButtonText: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FCE8E6',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  deleteButtonText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
  },
  recordingButton: {
    backgroundColor: '#D32F2F',
  },
  recordButtonIcon: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  recordHint: {
    color: '#667085',
    fontSize: 12,
    marginTop: 10,
  },
  sendButton: {
    backgroundColor: '#075E54',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 25,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
