
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

const quickActions = [
  { icon: '💬', title: 'Messages', description: 'Chat with friends' },
  { icon: '📸', title: 'Status', description: 'Share your moments' },
  { icon: '🎬', title: 'Watch', description: 'Discover videos' },
  { icon: '🔴', title: 'Go Live', description: 'Stream with everyone' }
];

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome to</Text>
          <Text style={styles.logo}>KONNEKT</Text>
        </View>

        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Stay connected.</Text>
        <Text style={styles.welcomeTitle}>Stay creative.</Text>
        <Text style={styles.welcomeDescription}>
          Chat, share moments, watch videos and connect live.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Explore KONNEKT</Text>

      <View style={styles.actionGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={() => {
              if (action.title === 'Messages') {
                navigation.navigate('Chats');
              } else if (action.title === 'Watch') {
                navigation.navigate('Watch');
              } else if (action.title === 'Go Live') {
                navigation.navigate('LiveStreamSetup');
              } else if (action.title === 'Status') {
                navigation.navigate('CreateStatus');
              }
            }}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>
              {action.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Your KONNEKT journey starts here</Text>
        <Text style={styles.tipText}>
          Find friends, start conversations and share your creativity.
        </Text>
      </View>
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
  greeting: {
    color: '#B8C4D4',
    fontSize: 15
  },
  logo: {
    color: '#00E5A8',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 3
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14243A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 25
  },
  welcomeCard: {
    backgroundColor: '#14243A',
    borderRadius: 18,
    padding: 22,
    marginBottom: 30
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold'
  },
  welcomeDescription: {
    color: '#B8C4D4',
    fontSize: 14,
    marginTop: 15,
    lineHeight: 21
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#14243A',
    borderRadius: 15,
    padding: 17,
    marginBottom: 15
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 12
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  actionDescription: {
    color: '#8A99AD',
    fontSize: 12,
    marginTop: 6
  },
  tipCard: {
    backgroundColor: '#10352F',
    borderRadius: 15,
    padding: 18,
    marginTop: 10,
    marginBottom: 30
  },
  tipTitle: {
    color: '#00E5A8',
    fontSize: 16,
    fontWeight: 'bold'
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20
  }
});
