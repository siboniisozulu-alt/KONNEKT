
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';

export default function GroupPermissionsScreen({ navigation, route }) {
  const group = route?.params?.group || {
    name: route?.params?.groupName || 'Group',
  };

  const [permissions, setPermissions] = useState({
    editGroupInfo: 'admins',
    sendMessages: 'everyone',
    addMembers: true,
    approveMembers: false,
    allowInvites: true,
  });

  const updatePermission = (key, value) => {
    setPermissions((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const choosePermission = (key, title, options) => {
    Alert.alert(
      title,
      'Who should have permission?',
      [
        ...options.map((option) => ({
          text: option.label,
          onPress: () => updatePermission(key, option.value),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const savePermissions = () => {
    if (route?.params?.onSave) {
      route.params.onSave(permissions);
    }

    Alert.alert(
      'Settings not saved',
      'Group permission saving is not connected yet. No changes have been saved.'
    );
  };

  const renderChoice = (title, description, value, onPress) => (
    <TouchableOpacity
      style={styles.permissionCard}
      onPress={onPress}
    >
      <View style={styles.permissionInfo}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionDescription}>
          {description}
        </Text>
      </View>

      <Text style={styles.permissionValue}>
        {value === 'admins' ? 'Admins' : 'Everyone'}
      </Text>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const renderSwitch = (
    title,
    description,
    value,
    onValueChange
  ) => (
    <View style={styles.permissionCard}>
      <View style={styles.permissionInfo}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionDescription}>
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: '#D0D5DD',
          true: '#75C99A',
        }}
        thumbColor={value ? '#075E54' : '#F4F4F4'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Group permissions</Text>
          <Text style={styles.headerSubtitle}>
            {group.name}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Choose how members can participate and manage this group.
        </Text>

        <Text style={styles.sectionTitle}>
          GROUP ADMINISTRATION
        </Text>

        {renderChoice(
          'Edit group information',
          'Who can change the group name, photo and description?',
          permissions.editGroupInfo,
          () =>
            choosePermission(
              'editGroupInfo',
              'Edit group information',
              [
                { label: 'Only admins', value: 'admins' },
                { label: 'All members', value: 'everyone' },
              ]
            )
        )}

        <Text style={styles.sectionTitle}>
          MESSAGING
        </Text>

        {renderChoice(
          'Send messages',
          'Who can send messages in this group?',
          permissions.sendMessages,
          () =>
            choosePermission(
              'sendMessages',
              'Send messages',
              [
                { label: 'Only admins', value: 'admins' },
                { label: 'All members', value: 'everyone' },
              ]
            )
        )}

        <Text style={styles.sectionTitle}>
          MEMBERSHIP
        </Text>

        {renderSwitch(
          'Allow members to add people',
          'Let group members invite new participants.',
          permissions.addMembers,
          (value) => updatePermission('addMembers', value)
        )}

        {renderSwitch(
          'Approve new members',
          'Require admin approval before someone joins.',
          permissions.approveMembers,
          (value) => updatePermission('approveMembers', value)
        )}

        {renderSwitch(
          'Allow invitation links',
          'Allow members to share a group invitation link.',
          permissions.allowInvites,
          (value) => updatePermission('allowInvites', value)
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePermissions}
        >
          <Text style={styles.saveButtonText}>
            Save permissions
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Only authorized group administrators should be able to
          change these settings. The backend must enforce every
          permission before changes take effect.
        </Text>
      </ScrollView>
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
    paddingVertical: 17,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 12,
    marginTop: 3,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  intro: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 9,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  permissionInfo: {
    flex: 1,
    paddingRight: 8,
  },
  permissionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  permissionDescription: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  permissionValue: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrow: {
    color: '#667085',
    fontSize: 22,
    marginLeft: 7,
  },
  saveButton: {
    backgroundColor: '#075E54',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  note: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 15,
  },
});
