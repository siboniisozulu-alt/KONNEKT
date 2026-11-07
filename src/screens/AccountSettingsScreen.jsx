
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert
} from 'react-native';

export default function AccountSettingsScreen({ navigation }) {
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showOnline, setShowOnline] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  const showComingSoon = feature => {
    Alert.alert(
      feature,
      'This setting will be connected to your KONNEKT account later.'
    );
  };

  const renderSwitch = (title, description, value, onValueChange) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#263A53', true: '#00A77C' }}
        thumbColor={value ? '#00E5A8' : '#B8C4D4'}
      />
    </View>
  );

  const renderLink = (title, description) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => showComingSoon(title)}
    >
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <Text style={styles.sectionTitle}>Account</Text>

      {renderLink('Personal information', 'Manage your name and username')}

      {renderLink('Phone number', 'Manage your registered number')}

      {renderLink('Change password', 'Keep your account secure')}

      <Text style={styles.sectionTitle}>Privacy</Text>

      {renderSwitch(
        'Private account',
        'Approve followers before they see private content',
        privateAccount,
        setPrivateAccount
      )}

      {renderSwitch(
        'Show online status',
        'Let friends see when you are online',
        showOnline,
        setShowOnline
      )}

      {renderSwitch(
        'Read receipts',
        'Let people know when you have read their messages',
        readReceipts,
        setReadReceipts
      )}

      <Text style={styles.sectionTitle}>More</Text>

      {renderLink('Blocked accounts', 'Manage people you have blocked')}

      {renderLink('Help and support', 'Get assistance with KONNEKT')}

      {renderLink('Terms and privacy policy', 'Read our policies')}

      <Text style={styles.footer}>
        KONNEKT Settings • Version 1.0
      </Text>
    </ScrollView>
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
    marginBottom: 30
  },
  back: {
    color: '#00E5A8',
    fontSize: 16,
    marginBottom: 18
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold'
  },
  sectionTitle: {
    color: '#00E5A8',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 12
  },
  settingItem: {
    backgroundColor: '#14243A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingText: {
    flex: 1,
    paddingRight: 12
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  description: {
    color: '#8A99AD',
    fontSize: 12,
    marginTop: 5
  },
  arrow: {
    color: '#00E5A8',
    fontSize: 25
  },
  footer: {
    color: '#8A99AD',
    textAlign: 'center',
    marginVertical: 30,
    fontSize: 12
  }
});
