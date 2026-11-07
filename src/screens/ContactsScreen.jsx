
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

const sampleContacts = [];

export default function ContactsScreen({ navigation, route }) {
  const [search, setSearch] = useState('');

  const contacts = route?.params?.contacts || [];

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    (contact.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (contact.phone || '').includes(search)
  );

  const openContact = (contact) => {
    if (contact.onKonnekt) {
      navigation.navigate('ChatConversation', {
        contact,
      });
    } else {
      Alert.alert(
        'Invite to KONNEKT',
        `${contact.name} is not registered on KONNEKT yet.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Invite',
            onPress: () => {
              Alert.alert(
                'Invitation',
                'Contact invitation sharing will be added later.'
              );
            },
          },
        ]
      );
    }
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactRow}
      onPress={() => openContact(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.initials}</Text>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          item.onKonnekt ? styles.activeBadge : styles.inviteBadge,
        ]}
      >
        <Text style={styles.badgeText}>
          {item.onKonnekt ? 'KONNEKT' : 'INVITE'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Contacts</Text>

        <View style={{ width: 45 }} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.heading}>Find your people</Text>
        <Text style={styles.description}>
          Connect with friends already on KONNEKT or invite
          others to join.
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search name, username or number..."
        placeholderTextColor="#888888"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No contacts found.
          </Text>
        }
      />

      <Text style={styles.footer}>
        Contact matching will require your permission and
        secure phone-number matching. Device contact matching is not connected. No contacts are being imported.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    color: '#075E54',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#17202A',
  },
  intro: {
    padding: 18,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#17202A',
  },
  description: {
    fontSize: 13,
    color: '#667085',
    lineHeight: 19,
    marginTop: 6,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 11,
    color: '#17202A',
  },
  list: {
    padding: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 13,
    marginBottom: 9,
    borderRadius: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D5F5E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#075E54',
    fontWeight: 'bold',
    fontSize: 15,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#17202A',
  },
  username: {
    fontSize: 12,
    color: '#075E54',
    marginTop: 3,
  },
  phone: {
    fontSize: 11,
    color: '#667085',
    marginTop: 3,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 7,
  },
  activeBadge: {
    backgroundColor: '#D5F5E3',
  },
  inviteBadge: {
    backgroundColor: '#FDEBD0',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#17202A',
  },
  emptyText: {
    textAlign: 'center',
    color: '#667085',
    marginTop: 35,
  },
  footer: {
    textAlign: 'center',
    color: '#667085',
    fontSize: 11,
    padding: 14,
    lineHeight: 17,
  },
});
