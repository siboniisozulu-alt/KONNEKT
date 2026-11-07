
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function ShareLocationScreen({
  navigation,
  route,
}) {
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
  };

  const [sharingMode, setSharingMode] = useState('Current');
  const [duration, setDuration] = useState('1 hour');

  const durations = ['15 minutes', '1 hour', '8 hours'];

  const shareLocation = () => {
    Alert.alert(
      'Location sharing preview',
      sharingMode === 'Current'
        ? `A current-location message for ${contact.name} will be shared when location services are connected.`
        : `Live-location sharing for ${contact.name} is set to ${duration}. Real GPS sharing will be connected later.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
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

        <View>
          <Text style={styles.headerTitle}>Share location</Text>
          <Text style={styles.headerSubtitle}>
            With {contact.name}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapPreview}>
          <Text style={styles.mapIcon}>📍</Text>
          <Text style={styles.mapTitle}>Location preview</Text>
          <Text style={styles.mapText}>
            Your map and current position will appear here after
            location permission is connected.
          </Text>
          <Text style={styles.mapPlaceholder}>
            MAP PREVIEW
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          CHOOSE WHAT TO SHARE
        </Text>

        <TouchableOpacity
          style={[
            styles.option,
            sharingMode === 'Current' && styles.activeOption,
          ]}
          onPress={() => setSharingMode('Current')}
        >
          <Text style={styles.optionIcon}>📍</Text>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              Send current location
            </Text>
            <Text style={styles.optionDescription}>
              Share one location point in the chat.
            </Text>
          </View>
          <Text style={styles.radio}>
            {sharingMode === 'Current' ? '🔘' : '⚪'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            sharingMode === 'Live' && styles.activeOption,
          ]}
          onPress={() => setSharingMode('Live')}
        >
          <Text style={styles.optionIcon}>🧭</Text>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              Share live location
            </Text>
            <Text style={styles.optionDescription}>
              Allow the recipient to follow your moving location.
            </Text>
          </View>
          <Text style={styles.radio}>
            {sharingMode === 'Live' ? '🔘' : '⚪'}
          </Text>
        </TouchableOpacity>

        {sharingMode === 'Live' && (
          <View style={styles.durationSection}>
            <Text style={styles.durationTitle}>
              LIVE LOCATION DURATION
            </Text>

            {durations.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.durationRow}
                onPress={() => setDuration(item)}
              >
                <Text style={styles.durationText}>{item}</Text>
                <Text style={styles.radio}>
                  {duration === item ? '🔘' : '⚪'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.privacyNotice}>
          <Text style={styles.privacyTitle}>
            🔒 Your privacy matters
          </Text>
          <Text style={styles.privacyText}>
            Location sharing should only happen with your
            permission. You should be able to stop live sharing
            whenever you choose.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareLocation}
        >
          <Text style={styles.shareButtonText}>
            Share location →
          </Text>
        </TouchableOpacity>
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
    marginRight: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 11,
    marginTop: 3,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  mapPreview: {
    height: 210,
    backgroundColor: '#DCEBE5',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 24,
  },
  mapIcon: {
    fontSize: 40,
  },
  mapTitle: {
    color: '#075E54',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 8,
  },
  mapText: {
    color: '#526B60',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 6,
  },
  mapPlaceholder: {
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 12,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  activeOption: {
    borderColor: '#075E54',
    backgroundColor: '#EAF5F1',
  },
  optionIcon: {
    fontSize: 25,
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  optionDescription: {
    color: '#667085',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  radio: {
    fontSize: 17,
    marginLeft: 8,
  },
  durationSection: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 15,
  },
  durationTitle: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  durationText: {
    color: '#17202A',
    fontSize: 13,
  },
  privacyNotice: {
    backgroundColor: '#E5F4EC',
    padding: 15,
    borderRadius: 12,
    marginTop: 12,
  },
  privacyTitle: {
    color: '#075E54',
    fontSize: 13,
    fontWeight: 'bold',
  },
  privacyText: {
    color: '#426B59',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 7,
  },
  shareButton: {
    backgroundColor: '#075E54',
    padding: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 22,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
