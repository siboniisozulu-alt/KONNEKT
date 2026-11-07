
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

const attachmentOptions = [
  {
    id: '1',
    title: 'Photos',
    description: 'Choose pictures from your gallery',
    icon: '🖼️',
    color: '#E8F5E9',
  },
  {
    id: '2',
    title: 'Videos',
    description: 'Share videos from your device',
    icon: '🎬',
    color: '#FCE4EC',
  },
  {
    id: '3',
    title: 'Camera',
    description: 'Take a new photo or video',
    icon: '📷',
    color: '#E3F2FD',
  },
  {
    id: '4',
    title: 'Documents',
    description: 'Share PDF and other files',
    icon: '📄',
    color: '#FFF3E0',
  },
  {
    id: '5',
    title: 'Location',
    description: 'Share your current location',
    icon: '📍',
    color: '#F3E5F5',
  },
  {
    id: '6',
    title: 'Contact',
    description: 'Share a contact card',
    icon: '👤',
    color: '#E0F2F1',
  },
];

export default function ChatAttachmentsScreen({
  navigation,
  route,
}) {
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
  };

  const handleAttachment = (item) => {
    if (item.title === 'Photos' || item.title === 'Videos') {
      navigation.navigate('MediaPicker', {
        mediaType: item.title.toLowerCase(),
        contact,
      });
      return;
    }

    if (item.title === 'Documents') {
      navigation.navigate('DocumentPicker', {
        contact,
      });
      return;
    }

    if (item.title === 'Camera') {
      navigation.navigate('CameraScreen', {
        contact,
      });
      return;
    }

    if (item.title === 'Location') {
      navigation.navigate('ShareLocationScreen', {
        contact,
      });
      return;
    }

    if (item.title === 'Contact') {
      navigation.navigate('ShareContactScreen', {
        contact,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Share attachment</Text>
          <Text style={styles.headerSubtitle}>
            To {contact.name}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Choose what you want to share in your KONNEKT chat.
        </Text>

        <View style={styles.optionsGrid}>
          {attachmentOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.optionCard}
              onPress={() => handleAttachment(item)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.color },
                ]}
              >
                <Text style={styles.optionIcon}>
                  {item.icon}
                </Text>
              </View>

              <Text style={styles.optionTitle}>
                {item.title}
              </Text>

              <Text style={styles.optionDescription}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            Share safely
          </Text>
          <Text style={styles.infoText}>
            Only share files and personal information that you
            intend the recipient to receive.
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
    padding: 17,
    paddingBottom: 35,
  },
  intro: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    minHeight: 155,
  },
  iconContainer: {
    width: 49,
    height: 49,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 25,
  },
  optionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionDescription: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  infoBox: {
    backgroundColor: '#E5F4EC',
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
  },
  infoTitle: {
    color: '#075E54',
    fontSize: 13,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#426B59',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },
});
