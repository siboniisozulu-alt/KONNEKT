
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions
} from 'react-native';

const { height } = Dimensions.get('window');

const sampleVideos = [
  {
    id: '1',
    creator: '@konnekt_creator',
    caption: 'Welcome to KONNEKT! 🎉',
    likes: 1250,
    comments: 86,
    shares: 42,
    background: '#183D50'
  },
  {
    id: '2',
    creator: '@south_africa',
    caption: 'Show the world your creativity! 🇿🇦',
    likes: 2450,
    comments: 120,
    shares: 75,
    background: '#49315B'
  },
  {
    id: '3',
    creator: '@music_zone',
    caption: 'Good vibes only! 🎶',
    likes: 980,
    comments: 45,
    shares: 30,
    background: '#65402E'
  }
];

export default function WatchScreen() {
  const [likedVideos, setLikedVideos] = useState([]);

  const toggleLike = id => {
    setLikedVideos(previous =>
      previous.includes(id)
        ? previous.filter(videoId => videoId !== id)
        : [...previous, id]
    );
  };

  const renderVideo = ({ item }) => {
    const liked = likedVideos.includes(item.id);

    return (
      <View
        style={[
          styles.videoCard,
          { backgroundColor: item.background }
        ]}
      >
        <View style={styles.videoPlaceholder}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.previewText}>
            KONNEKT VIDEO PREVIEW
          </Text>
          <Text style={styles.comingSoon}>
            Real videos will appear here
          </Text>
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.creator}>{item.creator}</Text>
          <Text style={styles.caption}>{item.caption}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item.id)}
          >
            <Text style={styles.actionIcon}>
              {liked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionCount}>
              {item.likes + (liked ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>
              {item.comments}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>↗️</Text>
            <Text style={styles.actionCount}>
              {item.shares}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionCount}>Follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KONNEKT</Text>
        <Text style={styles.headerSubtitle}>WATCH</Text>
      </View>

      <FlatList
        data={sampleVideos}
        keyExtractor={item => item.id}
        renderItem={renderVideo}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: '#07111F'
  },
  headerTitle: {
    color: '#00E5A8',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  videoCard: {
    height: Math.max(height - 145, 400),
    margin: 10,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center'
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 65
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 15
  },
  comingSoon: {
    color: '#D5E0EA',
    fontSize: 12,
    marginTop: 8
  },
  videoInfo: {
    position: 'absolute',
    bottom: 25,
    left: 18,
    right: 90
  },
  creator: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8
  },
  actions: {
    position: 'absolute',
    right: 15,
    bottom: 25,
    alignItems: 'center'
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20
  },
  actionIcon: {
    fontSize: 27
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
    fontWeight: 'bold'
  }
});
