
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

const sampleContacts = [
  { id: '1', name: 'Thabo Mokoena', phone: '+27 71 234 5678' },
  { id: '2', name: 'Lerato Nkosi', phone: '+27 82 345 6789' },
  { id: '3', name: 'Sipho Dlamini', phone: '+27 73 456 7890' },
  { id: '4', name: 'Nomsa Zulu', phone: '+27 76 567 8901' },
  { id: '5', name: 'Ayanda Khumalo', phone: '+27 79 678 9012' },
  { id: '6', name: 'Zanele Ndlovu', phone: '+27 81 789 0123' },
];

export default function ShareContactScreen({ navigation, route }) {
  const recipient = route?.params?.contact || {
    name: 'KONNEKT Contact',
  };

  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  const filteredContacts = sampleContacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    contact.phone.includes(search)
  );

  const toggleContact = (id) => {
    setSelectedContacts((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const sendContacts = () => {
    if (selectedContacts.length === 0) {
      Alert.alert(
        'Select a contact',
        'Please choose at least one contact to share.'
      );
      return;
    }

    const names = sampleContacts
      .filter((item) => selectedContacts.includes(item.id))
      .map((item) => item.name)
      .join(', ');

    Alert.alert(
      'Contact sharing preview',
      `Selected contact(s): ${names}\n\nRecipient: ${recipient.name}\n\nActual contact sharing will be connected later.`,
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
          <Text style={styles.headerTitle}>Share contacts</Text>
          <Text style={styles.headerSubtitle}>
            With {recipient.name}
          </Text>
        </View>

        <Text style={styles.count}>
          {selectedContacts.length}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>
        SELECT CONTACTS
      </Text>

      <ScrollView contentContainerStyle={styles.contactList}>
        {filteredContacts.length === 0 ? (
          <Text style={styles.emptyText}>
            No contacts found.
          </Text>
        ) : (
          filteredContacts.map((contact) => {
            const selected = selectedContacts.includes(contact.id);

            return (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactCard,
                  selected && styles.selectedCard,
                ]}
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
                  <Text style={styles.phone}>
                    {contact.phone}
                  </Text>
                </View>

                <View
                  style={[
                    styles.checkbox,
                    selected && styles.checkedBox,
                  ]}
                >
                  {selected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.selectedText}>
          {selectedContacts.length} contact(s) selected
        </Text>

        <TouchableOpacity
          style={[
            styles.sendButton,
            selectedContacts.length === 0 && styles.disabledButton,
          ]}
          onPress={sendContacts}
        >
          <Text style={styles.sendButtonText}>
            Share contacts →
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
  count: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    color: '#17202A',
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginHorizontal: 17,
    marginBottom: 10,
  },
  contactList: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  selectedCard: {
    backgroundColor: '#EAF5F1',
    borderColor: '#075E54',
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#D5EAE7',
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
  phone: {
    color: '#667085',
    fontSize: 11,
    marginTop: 4,
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#98A2B3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    color: '#667085',
    textAlign: 'center',
    marginTop: 35,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  selectedText: {
    color: '#667085',
    fontSize: 11,
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#075E54',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
