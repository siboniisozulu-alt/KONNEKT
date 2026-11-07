
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

const sampleBlockedContacts = [];

export default function BlockedContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState(sampleBlockedContacts);
  const [search, setSearch] = useState('');

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    contact.phone.includes(search)
  );

  const unblockContact = (contact) => {
    Alert.alert(
      'Unblock contact?',
      `Are you sure you want to unblock ${contact.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          onPress: () => {
            setContacts((previous) =>
              previous.filter((item) => item.id !== contact.id)
            );

            Alert.alert(
              'Contact unblocked',
              `${contact.name} has been removed from this demo blocked list.`
            );
          },
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
          <Text style={styles.headerTitle}>Blocked contacts</Text>
          <Text style={styles.headerSubtitle}>
            Manage who can contact you
          </Text>
        </View>

        <Text style={styles.headerIcon}>🚫</Text>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningIcon}>🛡️</Text>
        <Text style={styles.warningText}>
          Blocked contacts cannot message or call you through KONNEKT.
          They will not be notified that you blocked them.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search blocked contacts..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>
        BLOCKED ({filteredContacts.length})
      </Text>

      <ScrollView contentContainerStyle={styles.contactList}>
        {filteredContacts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛡️</Text>
            <Text style={styles.emptyTitle}>
              No blocked contacts found
            </Text>
            <Text style={styles.emptyText}>
              Your blocked contacts will appear here.
            </Text>
          </View>
        ) : (
          filteredContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {contact.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {contact.name}
                </Text>
                <Text style={styles.phone}>
                  {contact.phone}
                </Text>
                <Text style={styles.blockedDate}>
                  {contact.date}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.unblockButton}
                onPress={() => unblockContact(contact)}
              >
                <Text style={styles.unblockText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          You can block or report someone from their profile or chat.
          Blocking controls will be enforced when the privacy backend
          is connected.
        </Text>
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
    fontSize: 10,
    marginTop: 3,
  },
  headerIcon: {
    fontSize: 23,
  },
  warningBox: {
    backgroundColor: '#EAF2F1',
    margin: 15,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 23,
    marginRight: 11,
  },
  warningText: {
    flex: 1,
    color: '#526B67',
    fontSize: 11,
    lineHeight: 17,
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
    marginBottom: 10,
  },
  contactList: {
    paddingHorizontal: 15,
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
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FCE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  avatarText: {
    color: '#C0392B',
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
    fontSize: 10,
    marginTop: 4,
  },
  blockedDate: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 3,
  },
  unblockButton: {
    backgroundColor: '#EAF2F1',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
  },
  unblockText: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 65,
  },
  emptyIcon: {
    fontSize: 45,
  },
  emptyTitle: {
    color: '#17202A',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyText: {
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 6,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  footerText: {
    color: '#667085',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },
});
