
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

export default function StatusViewerScreen({ navigation, route }) {
  const status = route?.params?.status || {
    text: 'Welcome to KONNEKT!',
    backgroundColor: '#075E54',
    createdAt: new Date().toISOString(),
    author: 'KONNEKT User',
  };

  const [progress, setProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(15);

  useEffect(() => {
    const duration = 15000;
    const interval = 100;

    const timer = setInterval(() => {
      setProgress((previous) => {
        const next = previous + (interval / duration) * 100;

        if (next >= 100) {
          clearInterval(timer);
          navigation.goBack();
          return 100;
        }

        return next;
      });

      setRemainingSeconds((previous) => {
        return Math.max(0, previous - 0.1);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [navigation]);

  const closeViewer = () => {
    navigation.goBack();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: status.backgroundColor || '#075E54' },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%` },
          ]}
        />
      </View>

      <View style={styles.header}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>
            {(status.author || 'K').charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.authorDetails}>
          <Text style={styles.authorName}>
            {status.author || 'KONNEKT User'}
          </Text>

          <Text style={styles.timeText}>
            {Math.ceil(remainingSeconds)}s
          </Text>
        </View>

        <TouchableOpacity onPress={closeViewer}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusContent}>
        <Text style={styles.statusText}>
          {status.text || 'No status message'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          KONNEKT • Connect with everyone
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBackground: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
    marginTop: 12,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#075E54',
  },
  authorDetails: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  timeText: {
    color: '#E0E0E0',
    fontSize: 12,
    marginTop: 3,
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 23,
    paddingHorizontal: 8,
  },
  statusContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 39,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
});
