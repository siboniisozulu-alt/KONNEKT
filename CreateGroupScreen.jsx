
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';

const sampleContacts = [
  { id: '1', name: 'Thabo Mokoena', username: '@thabo' },
  { id: '2', name: 'Lerato Dlamini', username: '@lerato' },
  { id: '3', name: 'Sipho Nkosi', username: '@sipho' },
  { id: '4', name: 'Amahle Zulu', username: '@amahle' },
  { id: '5', name: 'Nomsa Khumalo', username: '@nomsa' },
];

export default function CreateGroupScreen({ navigation, route }) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const contacts = route?.params?.contacts || sampleContacts;

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (contact) => {
    setSelectedMembers((previous) => {
      const exists = previous.some(
        (member) => member.id === contact.id
      );

      if (exists) {
        return previous.filter(
          (member) => member.id !== contact.id
        );
      }

      return [...previous, contact];
    });
  };

  const createGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Group name required', 'Please enter a group name.');
      return;
    }

    if (selectedMembers.length < 2) {
      Alert.alert(
        'Select members',
        'Choose at least two members for your group.'
      );
      return;
    }

    const group = {
      id: Date.now().toString(),
      name: groupName.trim(),
      description: description.trim(),
      members: selectedMembers,
      createdAt: new Date().toISOString(),
    };

    if (route?.params?.onCreateGroup) {
      route.params.onCreateGroup(group);
    }

    Alert.alert(
      'Group prepared',
      `${group.name} has been prepared with ${selectedMembers.length} selected members. Group creation will be connected to the backend later.`,
      [
        {
          text: 'Continue',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderContact = ({ item }) => {
    const selected = selectedMembers.some(
      (member) => member.id === item.id
    );

    return (
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => toggleMember(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.username}>{item.username}</Text>
        </View>

        <View
          style={[
            styles.checkbox,
            selected && styles.checkboxSelected,
          ]}
        >
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>New Group</Text>

        <TouchableOpacity onPress={createGroup}>
          <Text style={styles.createButton}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Group name</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter group name"
          placeholderTextColor="#888888"
          value={groupName}
          onChangeText={setGroupName}
          maxLength={60}
        />

        <Text style={styles.label}>Group description (optional)</Text>

        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="What is this group about?"
          placeholderTextColor="#888888"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={200}
        />

        <Text style={styles.label}>
          Add members ({selectedMembers.length} selected)
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#888888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No contacts found.</Text>
        }
      />

      <Text style={styles.footer}>
        Selected members will be invited when group creation
        is connected to the KONNEKT backend.
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
    color: '#17202A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    color: '#075E54',
    fontWeight: 'bold',
    fontSize: 15,
  },
  form: {
    padding: 16,
  },
  label: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 13,
    color: '#17202A',
    fontSize: 14,
    marginBottom: 10,
  },
  descriptionInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 13,
    color: '#17202A',
  },
  list: {
    paddingHorizontal: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 11,
    marginBottom: 8,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#D5F5E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#075E54',
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    color: '#17202A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  username: {
    color: '#667085',
    fontSize: 12,
    marginTop: 3,
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#075E54',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#667085',
    padding: 25,
  },
  footer: {
    textAlign: 'center',
    color: '#667085',
    fontSize: 11,
    padding: 14,
    lineHeight: 17,
  },
});
