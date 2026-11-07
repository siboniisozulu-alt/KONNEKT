
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const sampleMembers = [];

export default function GroupInfoScreen({ navigation, route }) {
  const group = route?.params?.group || {
    id: '',
    name: route?.params?.groupName || 'Group',
    description: '',
    members: [],
  };

  const members = group.members || [];

  const showMessage = (title, message) => {
    Alert.alert(title, message);
  };

  const renderMember = (member) => (
    <View key={member.id} style={styles.memberRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {member.initials ||
            (member.name || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role || 'Member'}</Text>
      </View>

      <TouchableOpacity
        onPress={() =>
          showMessage(
            'Member options',
            'Member profile and management options will be added later.'
          )
        }
      >
        <Text style={styles.moreButton}>•••</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Group Info</Text>

        <View style={{ width: 45 }} />
      </View>

      <View style={styles.groupHeader}>
        <View style={styles.groupAvatar}>
          <Text style={styles.groupAvatarText}>👥</Text>
        </View>

        <Text style={styles.groupName}>{group.name}</Text>

        <Text style={styles.memberCount}>
          {members.length} members
        </Text>

        <Text style={styles.groupDescription}>
          {group.description || 'No group description.'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            showMessage('Add Members', 'Adding members will be connected later.')
          }
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            showMessage('Share Group', 'Group invitation links will be added later.')
          }
        >
          <Text style={styles.actionIcon}>🔗</Text>
          <Text style={styles.actionText}>Invite</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            showMessage('Edit Group', 'Group editing will be added later.')
          }
        >
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Participants ({members.length})
        </Text>

        {members.map(renderMember)}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.managementOption}
          onPress={() =>
            showMessage('Notifications', 'Group notification settings will be added later.')
          }
        >
          <Text style={styles.managementText}>Mute Notifications</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.managementOption}
          onPress={() =>
            showMessage('Media', 'Shared group media will appear here later.')
          }
        >
          <Text style={styles.managementText}>Shared Media</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.managementOption}
          onPress={() =>
            showMessage('Leave Group', 'Leaving a group will be implemented later.')
          }
        >
          <Text style={styles.dangerText}>Leave Group</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Group management and membership changes will be saved
        securely once backend integration is complete.
      </Text>
    </ScrollView>
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
  headerTitle: {
    color: '#17202A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupHeader: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 25,
  },
  groupAvatar: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#D5F5E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatarText: {
    fontSize: 42,
  },
  groupName: {
    color: '#17202A',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 15,
  },
  memberCount: {
    color: '#075E54',
    fontSize: 13,
    marginTop: 5,
  },
  groupDescription: {
    color: '#667085',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    paddingVertical: 17,
  },
  actionButton: {
    alignItems: 'center',
    minWidth: 75,
  },
  actionIcon: {
    fontSize: 23,
  },
  actionText: {
    color: '#075E54',
    fontWeight: 'bold',
    marginTop: 7,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#17202A',
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    color: '#17202A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  memberRole: {
    color: '#667085',
    fontSize: 12,
    marginTop: 3,
  },
  moreButton: {
    color: '#667085',
    fontSize: 18,
    paddingHorizontal: 8,
  },
  managementOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  managementText: {
    color: '#17202A',
    fontSize: 14,
  },
  dangerText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrow: {
    color: '#667085',
    fontSize: 22,
  },
  footer: {
    textAlign: 'center',
    color: '#667085',
    fontSize: 11,
    padding: 18,
    lineHeight: 17,
  },
});
