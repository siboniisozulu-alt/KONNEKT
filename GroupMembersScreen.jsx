
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

const demoMembers = [];

export default function GroupMembersScreen({ navigation, route }) {
  const group = route?.params?.group || {
    name: route?.params?.groupName || 'Group',
  };

  const [members, setMembers] = useState(
    route?.params?.members || []
  );

  const [search, setSearch] = useState('');

  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.username}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const updateRole = (member) => {
    if (member.role === 'Admin') {
      Alert.alert(
        'Remove administrator role?',
        `Change ${member.name} to a regular member?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change role',
            onPress: () => {
              setMembers((previous) =>
                previous.map((item) =>
                  item.id === member.id
                    ? { ...item, role: 'Member' }
                    : item
                )
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Make group admin?',
        `Give ${member.name} administrator privileges?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Make admin',
            onPress: () => {
              setMembers((previous) =>
                previous.map((item) =>
                  item.id === member.id
                    ? { ...item, role: 'Admin' }
                    : item
                )
              );
            },
          },
        ]
      );
    }
  };

  const removeMember = (member) => {
    Alert.alert(
      'Remove group member?',
      `Are you sure you want to remove ${member.name} from ${group.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMembers((previous) =>
              previous.filter((item) => item.id !== member.id)
            );
          },
        },
      ]
    );
  };

  const addMember = () => {
    navigation.navigate('Contacts', {
      group,
      selectionMode: true,
    });
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberCard}>
      <View
        style={[
          styles.avatar,
          { backgroundColor: item.color || '#D6EAF8' },
        ]}
      >
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.username}>{item.username}</Text>
      </View>

      <View
        style={[
          styles.roleBadge,
          item.role === 'Admin'
            ? styles.adminBadge
            : styles.memberBadge,
        ]}
      >
        <Text
          style={[
            styles.roleText,
            item.role === 'Admin'
              ? styles.adminText
              : styles.regularText,
          ]}
        >
          {item.role}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => {
          Alert.alert(item.name, 'Choose a member action', [
            { text: 'Cancel', style: 'cancel' },
            {
              text:
                item.role === 'Admin'
                  ? 'Remove admin role'
                  : 'Make group admin',
              onPress: () => updateRole(item),
            },
            {
              text: 'Remove from group',
              style: 'destructive',
              onPress: () => removeMember(item),
            },
          ]);
        }}
      >
        <Text style={styles.moreText}>⋮</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Group members</Text>
          <Text style={styles.headerSubtitle}>
            {group.name} · {members.length} members
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search members"
          placeholderTextColor="#8A929B"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={addMember}
      >
        <View style={styles.addIcon}>
          <Text style={styles.addIconText}>+</Text>
        </View>
        <Text style={styles.addButtonText}>Add members</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        PEOPLE IN THIS GROUP
      </Text>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No members found.
          </Text>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Group member permissions are managed by administrators.
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 15,
    paddingVertical: 16,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 14,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 12,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 15,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E8EA',
  },
  searchIcon: {
    fontSize: 24,
    color: '#667085',
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: '#17202A',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E8EA',
  },
  addIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D5F5E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addIconText: {
    color: '#075E54',
    fontSize: 27,
    fontWeight: 'bold',
  },
  addButtonText: {
    color: '#075E54',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginHorizontal: 18,
    marginTop: 23,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F2',
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#344054',
    fontSize: 17,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  username: {
    color: '#667085',
    fontSize: 12,
    marginTop: 3,
  },
  roleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#D5F5E3',
  },
  memberBadge: {
    backgroundColor: '#EEF0F2',
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  adminText: {
    color: '#087443',
  },
  regularText: {
    color: '#667085',
  },
  moreButton: {
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  moreText: {
    color: '#667085',
    fontSize: 22,
  },
  emptyText: {
    color: '#667085',
    textAlign: 'center',
    marginTop: 35,
  },
  footer: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E3E8EA',
  },
  footerText: {
    color: '#667085',
    fontSize: 11,
    textAlign: 'center',
  },
});
