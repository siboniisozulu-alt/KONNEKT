
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function CreatorAccountOverviewScreen({ navigation }) {
  const creator = {
    name: 'KONNEKT Creator',
    username: '@konnektcreator',
    category: 'Digital Creator',
    followers: '2,450',
    following: '380',
    videos: '42',
  };

  const tools = [
    {
      title: 'Creator Studio',
      description: 'Manage your creator dashboard.',
      icon: '📊',
      screen: 'CreatorStudio',
    },
    {
      title: 'My Content',
      description: 'Manage videos and drafts.',
      icon: '🎞️',
      screen: 'CreatorContentManagement',
    },
    {
      title: 'Creator Analytics',
      description: 'Explore performance statistics.',
      icon: '📈',
      screen: 'CreatorAnalytics',
    },
    {
      title: 'Creator Earnings',
      description: 'View the earnings preview.',
      icon: '💰',
      screen: 'CreatorEarnings',
    },
    {
      title: 'Monetization',
      description: 'Explore proposed earning features.',
      icon: '🪙',
      screen: 'CreatorMonetization',
    },
    {
      title: 'Subscriptions',
      description: 'Explore supporter membership options.',
      icon: '⭐',
      screen: 'CreatorSubscriptions',
    },
    {
      title: 'Brand Partnerships',
      description: 'Explore sample sponsorship campaigns.',
      icon: '🤝',
      screen: 'CreatorBrandPartnerships',
    },
    {
      title: 'Creator Verification',
      description: 'View the verification application.',
      icon: '🔵',
      screen: 'CreatorVerification',
    },
    {
      title: 'Creator Safety',
      description: 'Manage safety preferences.',
      icon: '🛡️',
      screen: 'CreatorSafety',
    },
    {
      title: 'Creator Settings',
      description: 'Manage creator account preferences.',
      icon: '⚙️',
      screen: 'CreatorSettings',
    },
  ];

  const openTool = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Creator Account</Text>

        <Text style={styles.headerIcon}>🌟</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>KC</Text>
        </View>

        <Text style={styles.creatorName}>{creator.name}</Text>
        <Text style={styles.username}>{creator.username}</Text>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{creator.category}</Text>
        </View>

        <Text style={styles.profileNote}>
          Sample creator profile
        </Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{creator.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{creator.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{creator.videos}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          Creator account status
        </Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Creator profile</Text>
          <Text style={styles.activeStatus}>Preview active</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Verification</Text>
          <Text style={styles.pendingStatus}>Not verified</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Monetization</Text>
          <Text style={styles.pendingStatus}>Not activated</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => openTool('CreatorStudio')}
        >
          <Text style={styles.quickIcon}>📊</Text>
          <Text style={styles.quickText}>Studio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => openTool('CreatorContentManagement')}
        >
          <Text style={styles.quickIcon}>🎬</Text>
          <Text style={styles.quickText}>My content</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => openTool('CreatorEarnings')}
        >
          <Text style={styles.quickIcon}>💰</Text>
          <Text style={styles.quickText}>Earnings</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Creator tools</Text>

      <View style={styles.toolsCard}>
        {tools.map((tool, index) => (
          <TouchableOpacity
            key={tool.screen}
            style={[
              styles.toolRow,
              index !== tools.length - 1 && styles.separator,
            ]}
            onPress={() => openTool(tool.screen)}
          >
            <View style={styles.toolIconBox}>
              <Text style={styles.toolIcon}>{tool.icon}</Text>
            </View>

            <View style={styles.toolInfo}>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription}>
                {tool.description}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Prototype information</Text>
        <Text style={styles.noticeText}>
          Profile details and statistics are sample data.
          Creator earnings, subscriptions and verification are
          not active services. Real account data will require
          backend integration.
        </Text>
      </View>

      <Text style={styles.footer}>
        KONNEKT — Connect, create and grow together.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  content: {
    paddingBottom: 35,
  },
  header: {
    backgroundColor: '#075E54',
    paddingTop: 43,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerIcon: {
    fontSize: 21,
  },
  profileCard: {
    backgroundColor: '#075E54',
    margin: 14,
    padding: 23,
    borderRadius: 13,
    alignItems: 'center',
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#075E54',
    fontSize: 23,
    fontWeight: 'bold',
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 12,
  },
  username: {
    color: '#D1E7E3',
    fontSize: 10,
    marginTop: 5,
  },
  categoryBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12,
  },
  categoryText: {
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
  },
  profileNote: {
    color: '#D1E7E3',
    fontSize: 9,
    marginTop: 10,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    paddingVertical: 17,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#075E54',
    fontSize: 17,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#667085',
    fontSize: 9,
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EAECF0',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 15,
    borderRadius: 10,
  },
  statusTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
  },
  statusLabel: {
    color: '#475467',
    fontSize: 10,
  },
  activeStatus: {
    color: '#067647',
    fontSize: 9,
    fontWeight: 'bold',
  },
  pendingStatus: {
    color: '#B54708',
    fontSize: 9,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: 14,
    gap: 9,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 9,
    alignItems: 'center',
  },
  quickIcon: {
    fontSize: 23,
  },
  quickText: {
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 7,
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 21,
    marginBottom: 10,
  },
  toolsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    paddingHorizontal: 13,
    borderRadius: 10,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  toolIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F4F1',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  toolIcon: {
    fontSize: 20,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    color: '#17202A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  toolDescription: {
    color: '#667085',
    fontSize: 9,
    marginTop: 4,
  },
  arrow: {
    color: '#98A2B3',
    fontSize: 23,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#EAECF0',
  },
  notice: {
    backgroundColor: '#FFF7E8',
    margin: 14,
    padding: 13,
    borderRadius: 9,
  },
  noticeTitle: {
    color: '#9A6700',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noticeText: {
    color: '#7A4F01',
    fontSize: 9,
    lineHeight: 15,
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 5,
  },
});
