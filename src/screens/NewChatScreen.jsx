
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from 'react-native';

const sampleContacts = [
  {
    id: '1',
    name: 'Thabo',
    phone: '+27820000001',
    username: '@thabo',
    avatar: '👨🏽'
  },
  {
    id: '2',
    name: 'Lerato',
    phone: '+27820000002',
    username: '@lerato',
    avatar: '👩🏽'
  },
  {
    id: '3',
    name: 'Sipho',
    phone: '+27820000003',
    username: '@sipho',
    avatar: '👨🏿'
  },
  {
    id: '4',
    name: 'Nomsa',
    phone: '+27820000004',
    username: '@nomsa',
    avatar: '👩🏿'
  }
];

export default function NewChatScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const filteredContacts = sampleContacts.filter(contact => {
    const query = search.toLowerCase();

    return (
      contact.name.toLowerCase().includes(query) ||
      contact.phone.includes(query) ||
      contact.username.toLowerCase().includes(query)
    );
  });

  const openConversation = contact => {
    navigation.navigate('ChatConversation', {
      chatId: contact.id,
      chatName: contact.name,
      phoneNumber: contact.phone
    });
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => openConversation(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>

      <View style={styles.contactDetails}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>New Chat</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search name or phone number..."
        placeholderTextColor="#8A99AD"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />

      <Text style={styles.sectionTitle}>KONNEKT Contacts</Text>

      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.id}
        renderItem={renderContact}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No contacts found.
          </Text>
        }
      />

      <Text style={styles.notice}>
        Contact discovery and private phone-number matching
        will be connected securely through the backend.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
    padding: 20
  },
  header: {
    marginTop: 25,
    marginBottom: 22
  },
  back: {
    color: '#00E5A8',
    fontSize: 16,
    marginBottom: 15
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold'
  },
  search: {
    backgroundColor: '#14243A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 22
  },
  sectionTitle: {
    color: '#00E5A8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#263A53'
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#14243A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13
  },
  avatarText: {
    fontSize: 25
  },
  contactDetails: {
    flex: 1
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  username: {
    color: '#00E5A8',
    fontSize: 12,
    marginTop: 3
  },
  phone: {
    color: '#8A99AD',
    fontSize: 12,
    marginTop: 3
  },
  arrow: {
    color: '#00E5A8',
    fontSize: 27
  },
  emptyText: {
    color: '#8A99AD',
    textAlign: 'center',
    marginTop: 35
  },
  notice: {
    color: '#8A99AD',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 15,
    lineHeight: 17
  }
});
