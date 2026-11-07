
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

const sampleContacts = [];

export default function ForwardMessageScreen({ navigation, route }) {
  const message = route?.params?.message || {
    text: 'Hello! Check out this message.',
  };

  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  const filteredContacts = (route?.params?.contacts || []).filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleContact = (id) => {
    setSelectedContacts((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const forwardMessage = () => {
    if (selectedContacts.length === 0) {
      Alert.alert(
        'Select contacts',
        'Choose at least one person to forward this message.'
      );
      return;
    }

    const selectedNames = (route?.params?.contacts || [])
      .filter((contact) => selectedContacts.includes(contact.id))
      .map((contact) => contact.name);

    Alert.alert(
      'Ready to forward',
      `Selected: ${selectedNames.join(', ')}\n\nActual forwarding will work when KONNEKT messaging is connected to its backend.`,
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

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Forward message</Text>
          <Text style={styles.headerSubtitle}>
            {selectedContacts.length} selected
          </Text>
        </View>
      </View>

      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>MESSAGE TO FORWARD</Text>
        <View style={styles.previewCard}>
          <Text style={styles.previewText}>{message.text}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>CHOOSE CONTACTS</Text>

      <ScrollView contentContainerStyle={styles.contactList}>
        {filteredContacts.map((contact) => {
          const selected = selectedContacts.includes(contact.id);

          return (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactRow}
              onPress={() => toggleContact(contact.id)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {contact.name.charAt(0)}
                </Text>
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {contact.name}
                </Text>
                <Text style={styles.contactStatus}>
                  {contact.online ? 'Online' : 'KONNEKT contact'}
                </Text>
              </View>

              <View
                style={[
                  styles.checkbox,
                  selected && styles.checkboxSelected,
                ]}
              >
                {selected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredContacts.length === 0 && (
          <Text style={styles.emptyText}>
            No contacts found.
          </Text>
        )}
      </ScrollView>

      {selectedContacts.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.selectedText}>
            {selectedContacts.length} contact(s) selected
          </Text>

          <TouchableOpacity
            style={styles.forwardButton}
            onPress={forwardMessage}
          >
            <Text style={styles.forwardButtonText}>
              Forward →
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
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
  previewSection: {
    padding: 16,
  },
  previewLabel: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  previewCard: {
    backgroundColor: '#DCF8C6',
    padding: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  previewText: {
    color: '#17202A',
    fontSize: 13,
    lineHeight: 19,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  searchIcon: {
    fontSize: 17,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    color: '#17202A',
    fontSize: 13,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginHorizontal: 17,
    marginTop: 20,
    marginBottom: 8,
  },
  contactList: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF0F2',
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#D9EEE9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#075E54',
    fontSize: 17,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  contactStatus: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#B8C2CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#98A2B3',
    textAlign: 'center',
    marginTop: 35,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedText: {
    color: '#475467',
    fontSize: 11,
  },
  forwardButton: {
    backgroundColor: '#075E54',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 22,
  },
  forwardButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
