
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function CreateStatusScreen({ navigation, route }) {
  const [statusText, setStatusText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#075E54');

  const colors = [
    '#075E54',
    '#128C7E',
    '#6C3483',
    '#2874A6',
    '#B03A2E',
    '#17202A',
  ];

  const publishStatus = () => {
    const message = statusText.trim();

    if (!message) {
      Alert.alert('Empty status', 'Please write something first.');
      return;
    }

    // Demo only: this does not yet save the status to a server.
    const newStatus = {
      id: Date.now().toString(),
      text: message,
      backgroundColor,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    if (route?.params?.onPublish) {
      route.params.onPublish(newStatus);
    }

    Alert.alert(
      'KONNEKT',
      'Your status has been prepared. Server publishing will be connected later.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Status</Text>

        <TouchableOpacity onPress={publishStatus}>
          <Text style={styles.postButton}>Post</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.preview,
          { backgroundColor },
        ]}
      >
        <TextInput
          style={styles.statusInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#D6EAE7"
          value={statusText}
          onChangeText={setStatusText}
          multiline
          maxLength={700}
          textAlign="center"
        />

        <Text style={styles.characterCount}>
          {statusText.length}/700
        </Text>
      </View>

      <View style={styles.colorSection}>
        <Text style={styles.sectionTitle}>
          Choose a background
        </Text>

        <View style={styles.colorRow}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setBackgroundColor(color)}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                backgroundColor === color && styles.selectedColor,
              ]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.footerText}>
        Your status is designed to expire after 24 hours.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    color: '#075E54',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#17202A',
  },
  postButton: {
    color: '#075E54',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preview: {
    flex: 1,
    margin: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusInput: {
    width: '100%',
    minHeight: 150,
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '600',
    textAlignVertical: 'center',
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 12,
  },
  colorSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#17202A',
    marginBottom: 14,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#17202A',
  },
  footerText: {
    textAlign: 'center',
    color: '#667085',
    fontSize: 12,
    padding: 16,
  },
});
