
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

const initialVideos = [
  {
    id: '1',
    title: 'Beautiful moments in South Africa 🇿🇦',
    creator: 'Kasi Creator',
    category: 'Lifestyle',
    duration: '00:35',
    views: '12.5K',
    thumbnail: '🌍',
  },
  {
    id: '2',
    title: 'Funny township moments 😂',
    creator: 'Comedy Zone',
    category: 'Comedy',
    duration: '00:48',
    views: '45K',
    thumbnail: '😂',
  },
  {
    id: '3',
    title: 'Learn something new today',
    creator: 'Smart Academy',
    category: 'Education',
    duration: '01:12',
    views: '8.2K',
    thumbnail: '📚',
  },
  {
    id: '4',
    title: 'Amazing football skills',
    creator: 'Football Daily',
    category: 'Sports',
    duration: '00:29',
    views: '30K',
    thumbnail: '⚽',
  },
];

export default function SavedVideosScreen({ navigation }) {
  const [videos, setVideos] = useState(initialVideos);
  const [search, setSearch] = useState('');

  const filteredVideos = videos.filter((video) =>
    `${video.title} ${video.creator} ${video.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const removeVideo = (id) => {
    Alert.alert(
      'Remove saved video?',
      'This video will be removed from your saved list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            setVideos((previous) =>
              previous.filter((video) => video.id !== id)
            ),
        },
      ]
    );
  };

  const renderVideo = ({ item }) => (
    <View style={styles.videoCard}>
      <TouchableOpacity
        style={styles.thumbnail}
        onPress={() =>
          Alert.alert(
            'Video preview',
            'Connect the Watch player to open this saved video.'
          )
        }
      >
        <Text style={styles.thumbnailEmoji}>
          {item.thumbnail}
        </Text>
        <Text style={styles.duration}>
          {item.duration}
        </Text>
        <Text style={styles.playIcon}>▶</Text>
      </TouchableOpacity>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.creator}>
          @{item.creator}
        </Text>

        <View style={styles.metadata}>
          <Text style={styles.category}>
            {item.category}
          </Text>
          <Text style={styles.views}>
            {item.views} views
          </Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeVideo(item.id)}
        >
          <Text style={styles.removeText}>
            ♡ Remove from saved
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Saved videos</Text>

        <Text style={styles.headerIcon}>🔖</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved videos..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>
          Your collection
        </Text>
        <Text style={styles.summaryCount}>
          {videos.length} saved videos
        </Text>
      </View>

      {filteredVideos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔖</Text>
          <Text style={styles.emptyTitle}>
            No saved videos found
          </Text>
          <Text style={styles.emptyText}>
            Save videos from Watch to find them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVideos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  header: {
    backgroundColor: '#075E54',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  headerIcon: {
    fontSize: 22,
  },
  searchContainer: {
    margin: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  searchIcon: {
    fontSize: 23,
    color: '#667085',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#17202A',
    fontSize: 12,
  },
  summary: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryCount: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 25,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  thumbnail: {
    width: 112,
    height: 145,
    backgroundColor: '#DCEFEA',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbnailEmoji: {
    fontSize: 39,
  },
  duration: {
    position: 'absolute',
    bottom: 7,
    right: 7,
    color: '#FFFFFF',
    backgroundColor: '#17202A',
    padding: 4,
    borderRadius: 4,
    fontSize: 9,
  },
  playIcon: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 17,
    backgroundColor: '#00000055',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  videoInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  videoTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  creator: {
    color: '#667085',
    fontSize: 10,
    marginTop: 7,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },
  category: {
    backgroundColor: '#E8F4F1',
    color: '#075E54',
    fontSize: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  views: {
    color: '#98A2B3',
    fontSize: 9,
    marginLeft: 9,
  },
  removeButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 5,
  },
  removeText: {
    color: '#D92D20',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 45,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#17202A',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#98A2B3',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
