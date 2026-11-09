
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function MediaPickerScreen({ navigation, route }) {
  const mediaType = route?.params?.mediaType || 'photos';
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
  };

  const [selectedItems, setSelectedItems] = useState([]);

  // Media is populated only by a connected device media picker.
  const availableMedia = [];

  const toggleSelection = (id) => {
    setSelectedItems((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const sendMedia = () => {
    if (selectedItems.length === 0) {
      Alert.alert(
        'Select media',
        'Please select at least one item.'
      );
      return;
    }

    Alert.alert(
      'Media sharing unavailable',
      'Device media access and uploads are not connected in this build.',
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

        <View style={styles.headerText}>
          <Text style={styles.title}>
            {mediaType === 'videos' ? 'Choose videos' : 'Choose photos'}
          </Text>
          <Text style={styles.subtitle}>
            Sharing with {contact.name}
          </Text>
        </View>

        <Text style={styles.count}>
          {selectedItems.length}
        </Text>
      </View>

      <View style={styles.albumBar}>
        <Text style={styles.albumName}>Recent gallery</Text>
        <Text style={styles.albumArrow}>⌄</Text>
      </View>

      <ScrollView contentContainerStyle={styles.gallery}>
        {availableMedia.map((item) => {
          const selected = selectedItems.includes(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.mediaItem,
                selected && styles.selectedItem,
              ]}
              onPress={() => toggleSelection(item.id)}
            >
              <Text style={styles.mediaIcon}>{item.icon}</Text>

              {mediaType === 'videos' && (
                <Text style={styles.videoLabel}>▶ VIDEO</Text>
              )}

              {selected && (
                <View style={styles.selectionBadge}>
                  <Text style={styles.selectionText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        {availableMedia.length === 0 && <Text style={styles.emptyText}>No media is available. Device gallery access is not connected.</Text>}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.selectedText}>
          {selectedItems.length} selected
        </Text>

        <TouchableOpacity
          style={[
            styles.sendButton,
            selectedItems.length === 0 && styles.disabledButton,
          ]}
          onPress={sendMedia}
        >
          <Text style={styles.sendButtonText}>
            Send to chat →
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  back: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#D5EAE7',
    fontSize: 11,
    marginTop: 3,
  },
  count: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  albumBar: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  albumName: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: '600',
  },
  albumArrow: {
    color: '#075E54',
    fontSize: 18,
  },
  emptyText: { color: '#8293A8', textAlign: 'center', padding: 24 },
  gallery: {
    padding: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mediaItem: {
    width: '32.5%',
    aspectRatio: 1,
    margin: '0.4%',
    backgroundColor: '#E8EFEC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItem: {
    borderColor: '#075E54',
    backgroundColor: '#D5EAE7',
  },
  mediaIcon: {
    fontSize: 42,
  },
  videoLabel: {
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 5,
  },
  selectionBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  selectedText: {
    color: '#667085',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: '#075E54',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 25,
  },
  disabledButton: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
