
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const creatorVideos = [
  {
    id: '1',
    title: 'My first KONNEKT video',
    views: '12.5K',
    likes: '1.2K',
    comments: '145',
    emoji: '🎬',
  },
  {
    id: '2',
    title: 'Behind the scenes',
    views: '8.3K',
    likes: '740',
    comments: '82',
    emoji: '📸',
  },
  {
    id: '3',
    title: 'Weekend vibes',
    views: '5.1K',
    likes: '520',
    comments: '63',
    emoji: '🌍',
  },
];

export default function CreatorStudioScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('Overview');

  const tabs = ['Overview', 'Videos', 'Live'];

  const showTool = (tool) => {
    Alert.alert(
      tool,
      `${tool} will be connected to your creator account and backend in a future integration step.`
    );
  };

  const renderVideo = (item) => (
    <View key={item.id} style={styles.videoCard}>
      <View style={styles.videoThumbnail}>
        <Text style={styles.videoEmoji}>{item.emoji}</Text>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.title}</Text>

        <View style={styles.videoStats}>
          <Text style={styles.videoStat}>👁 {item.views}</Text>
          <Text style={styles.videoStat}>❤️ {item.likes}</Text>
          <Text style={styles.videoStat}>💬 {item.comments}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => showTool('Video management')}
      >
        <Text style={styles.more}>•••</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Creator Studio</Text>

        <TouchableOpacity
          onPress={() => showTool('Creator settings')}
        >
          <Text style={styles.settings}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🎨</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.creatorName}>Your Creator Account</Text>
          <Text style={styles.creatorHandle}>@yourkonnekt</Text>
          <Text style={styles.creatorStatus}>Creator dashboard</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => showTool('Edit creator profile')}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'Overview' && (
        <>
          <Text style={styles.sectionTitle}>
            Performance overview
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👁</Text>
              <Text style={styles.statNumber}>25.9K</Text>
              <Text style={styles.statLabel}>Video views</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statNumber}>2.4K</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumber}>1.8K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statNumber}>290</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Creator tools
          </Text>

          <View style={styles.toolsGrid}>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() =>
                navigation.navigate('CreatorEarnings')
              }
            >
              <Text style={styles.toolIcon}>💰</Text>
              <Text style={styles.toolTitle}>Earnings</Text>
              <Text style={styles.toolSubtitle}>
                View demo earnings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('LiveStreamSetup')}
            >
              <Text style={styles.toolIcon}>🔴</Text>
              <Text style={styles.toolTitle}>Go Live</Text>
              <Text style={styles.toolSubtitle}>
                Start a live session
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => showTool('Content analytics')}
            >
              <Text style={styles.toolIcon}>📊</Text>
              <Text style={styles.toolTitle}>Analytics</Text>
              <Text style={styles.toolSubtitle}>
                Track your performance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => showTool('Creator resources')}
            >
              <Text style={styles.toolIcon}>📚</Text>
              <Text style={styles.toolTitle}>Resources</Text>
              <Text style={styles.toolSubtitle}>
                Tips and guidance
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {selectedTab === 'Videos' && (
        <>
          <Text style={styles.sectionTitle}>
            Your uploaded videos
          </Text>

          {creatorVideos.map(renderVideo)}

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('Create')}
          >
            <Text style={styles.uploadText}>
              + Create new content
            </Text>
          </TouchableOpacity>
        </>
      )}

      {selectedTab === 'Live' && (
        <>
          <Text style={styles.sectionTitle}>
            Live streaming studio
          </Text>

          <View style={styles.liveCard}>
            <Text style={styles.liveIcon}>📡</Text>

            <Text style={styles.liveTitle}>
              Start your next live stream
            </Text>

            <Text style={styles.liveDescription}>
              Connect with your audience through live video.
            </Text>

            <TouchableOpacity
              style={styles.goLiveButton}
              onPress={() => navigation.navigate('LiveStreamSetup')}
            >
              <Text style={styles.goLiveText}>
                START LIVE
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => showTool('Past live streams')}
          >
            <Text style={styles.toolIcon}>📁</Text>
            <Text style={styles.toolTitle}>Past live streams</Text>
            <Text style={styles.toolSubtitle}>
              Your stream history will appear here.
            </Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.footer}>
        Statistics and creator activity are sample data until
        the KONNEKT backend is connected.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#075E54',
    padding: 17,
    paddingTop: 43,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  settings: {
    fontSize: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 14,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 27,
    backgroundColor: '#E8F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 27,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 11,
  },
  creatorName: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  creatorHandle: {
    color: '#667085',
    fontSize: 10,
    marginTop: 4,
  },
  creatorStatus: {
    color: '#075E54',
    fontSize: 9,
    marginTop: 4,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#075E54',
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editText: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: 11,
    alignItems: 'center',
    borderRadius: 7,
  },
  activeTab: {
    backgroundColor: '#075E54',
  },
  tabText: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 9,
  },
  statCard: {
    width: '46%',
    backgroundColor: '#FFFFFF',
    margin: '2%',
    padding: 14,
    borderRadius: 11,
  },
  statIcon: {
    fontSize: 21,
  },
  statNumber: {
    color: '#075E54',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 7,
  },
  statLabel: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 4,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 9,
  },
  toolCard: {
    width: '46%',
    backgroundColor: '#FFFFFF',
    margin: '2%',
    padding: 14,
    borderRadius: 11,
  },
  toolIcon: {
    fontSize: 25,
    marginBottom: 9,
  },
  toolTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toolSubtitle: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 5,
    lineHeight: 14,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 9,
    padding: 11,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#E8F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoEmoji: {
    fontSize: 25,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 11,
  },
  videoTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  videoStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  videoStat: {
    color: '#667085',
    fontSize: 9,
  },
  more: {
    color: '#667085',
    fontSize: 18,
    padding: 5,
  },
  uploadButton: {
    backgroundColor: '#075E54',
    margin: 14,
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  liveCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 20,
    borderRadius: 13,
    alignItems: 'center',
  },
  liveIcon: {
    fontSize: 42,
  },
  liveTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
  },
  liveDescription: {
    color: '#667085',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 7,
  },
  goLiveButton: {
    backgroundColor: '#D92D20',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 17,
  },
  goLiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    lineHeight: 15,
  },
});
