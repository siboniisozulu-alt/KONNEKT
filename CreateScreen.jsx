
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';

export default function CreateScreen({ navigation }) {
  const [caption, setCaption] = useState('');
  const [selectedType, setSelectedType] = useState('Video');

  const contentTypes = [
    { name: 'Video', icon: '🎬' },
    { name: 'Photo', icon: '📸' },
    { name: 'Status', icon: '⭕' },
    { name: 'Live', icon: '🔴' }
  ];

  const handleCreate = () => {
    if (selectedType === 'Live') {
      navigation.navigate('LiveStreamSetup');
      return;
    }
    if (selectedType === 'Status') {
      navigation.navigate('CreateStatus');
      return;
    }
    navigation.navigate('Watch');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create</Text>

      <Text style={styles.subtitle}>
        Share your creativity with the KONNEKT community.
      </Text>

      <View style={styles.preview}>
        <Text style={styles.previewIcon}>＋</Text>
        <Text style={styles.previewTitle}>Create something amazing</Text>
        <Text style={styles.previewDescription}>
          Select what you want to share.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Choose content type</Text>

      <View style={styles.typeGrid}>
        {contentTypes.map(type => (
          <TouchableOpacity
            key={type.name}
            style={[
              styles.typeCard,
              selectedType === type.name && styles.selectedCard
            ]}
            onPress={() => setSelectedType(type.name)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text style={styles.typeName}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Write a caption</Text>

      <TextInput
        style={styles.captionInput}
        placeholder="What would you like to share?"
        placeholderTextColor="#8A99AD"
        value={caption}
        onChangeText={setCaption}
        multiline
        maxLength={500}
      />

      <Text style={styles.characterCount}>
        {caption.length}/500
      </Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreate}
      >
        <Text style={styles.createButtonText}>
          {selectedType === 'Live' ? 'START LIVE' : 'CONTINUE'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Your content, your voice, your KONNEKT.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
    padding: 20
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 25
  },
  subtitle: {
    color: '#8A99AD',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 25
  },
  preview: {
    backgroundColor: '#14243A',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginBottom: 28
  },
  previewIcon: {
    color: '#00E5A8',
    fontSize: 55,
    fontWeight: 'bold'
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12
  },
  previewDescription: {
    color: '#8A99AD',
    fontSize: 13,
    marginTop: 8
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 13
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#14243A',
    borderWidth: 1,
    borderColor: '#263A53',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12
  },
  selectedCard: {
    borderColor: '#00E5A8',
    backgroundColor: '#10352F'
  },
  typeIcon: {
    fontSize: 30,
    marginBottom: 8
  },
  typeName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold'
  },
  captionInput: {
    backgroundColor: '#14243A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#263A53',
    minHeight: 110,
    padding: 15,
    color: '#FFFFFF',
    textAlignVertical: 'top'
  },
  characterCount: {
    color: '#8A99AD',
    textAlign: 'right',
    marginTop: 7,
    marginBottom: 20
  },
  createButton: {
    backgroundColor: '#00E5A8',
    borderRadius: 12,
    padding: 17,
    alignItems: 'center'
  },
  createButtonText: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: 'bold'
  },
  footer: {
    color: '#8A99AD',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 30
  }
});
