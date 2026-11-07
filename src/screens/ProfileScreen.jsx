
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';

export default function ProfileScreen({ navigation }) {
  const profileOptions = [
    { icon: '👥', title: 'Followers', value: '0' },
    { icon: '❤️', title: 'Following', value: '0' },
    { icon: '🎬', title: 'My videos', value: '0' },
    { icon: '📸', title: 'My statuses', value: '0' }
  ];

  const settings = [
    { icon: '🔒', title: 'Privacy and security' },
    { icon: '🔔', title: 'Notifications' },
    { icon: '💰', title: 'Creator earnings' },
    { icon: '⚙️', title: 'Account settings' },
    { icon: '❓', title: 'Help and support' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>

        <TouchableOpacity>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <Text style={styles.name}>KONNEKT User</Text>
        <Text style={styles.username}>@your_username</Text>

        <Text style={styles.bio}>
          Welcome to my KONNEKT profile!
        </Text>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>EDIT PROFILE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {profileOptions.map(option => (
          <View key={option.title} style={styles.statCard}>
            <Text style={styles.statValue}>{option.value}</Text>
            <Text style={styles.statTitle}>{option.title}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>My Account</Text>

      {settings.map(option => (
        <TouchableOpacity
          key={option.title}
          style={styles.option}
          onPress={() => {
            if (option.title === 'Account settings') {
              navigation.navigate('AccountSettings');
            }
          }}
        >
          <Text style={styles.optionIcon}>{option.icon}</Text>
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.logoutText}>LOG OUT</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>KONNEKT • Connect your world</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 25
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold'
  },
  settingsIcon: {
    fontSize: 25
  },
  profileCard: {
    backgroundColor: '#14243A',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center'
  },
  avatar: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#263A53',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 48
  },
  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15
  },
  username: {
    color: '#00E5A8',
    fontSize: 14,
    marginTop: 5
  },
  bio: {
    color: '#B8C4D4',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center'
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#00E5A8',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 30,
    marginTop: 20
  },
  editButtonText: {
    color: '#00E5A8',
    fontWeight: 'bold'
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 25
  },
  statCard: {
    width: '48%',
    backgroundColor: '#14243A',
    borderRadius: 12,
    padding: 17,
    alignItems: 'center',
    marginBottom: 12
  },
  statValue: {
    color: '#00E5A8',
    fontSize: 22,
    fontWeight: 'bold'
  },
  statTitle: {
    color: '#B8C4D4',
    fontSize: 12,
    marginTop: 5
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14243A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 14
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1
  },
  arrow: {
    color: '#8A99AD',
    fontSize: 25
  },
  logoutButton: {
    backgroundColor: '#44232D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15
  },
  logoutText: {
    color: '#FF7B89',
    fontWeight: 'bold'
  },
  footer: {
    color: '#8A99AD',
    textAlign: 'center',
    marginVertical: 25,
    fontSize: 12
  }
});
