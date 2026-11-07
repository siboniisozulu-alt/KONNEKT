
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

const trendingHashtags = [
  { id: '1', tag: 'KONNEKT', posts: '125K', category: 'Trending' },
  { id: '2', tag: 'SouthAfrica', posts: '98K', category: 'Popular' },
  { id: '3', tag: 'KasiLife', posts: '76K', category: 'Lifestyle' },
  { id: '4', tag: 'FunnyVideos', posts: '65K', category: 'Comedy' },
  { id: '5', tag: 'MusicZA', posts: '54K', category: 'Music' },
  { id: '6', tag: 'DanceChallenge', posts: '43K', category: 'Dance' },
  { id: '7', tag: 'Football', posts: '39K', category: 'Sports' },
  { id: '8', tag: 'LearnOnKONNEKT', posts: '28K', category: 'Education' },
];

const sampleVideos = [];

export default function HashtagScreen({ navigation, route }) {
  const [search, setSearch] = useState(
    route?.params?.hashtag
      ? route.params.hashtag.replace('#', '')
      : ''
  );

  const [selectedHashtag, setSelectedHashtag] = useState(
    route?.params?.hashtag
      ? route.params.hashtag.replace('#', '')
      : 'KONNEKT'
  );

  const filteredHashtags = trendingHashtags.filter((item) =>
    item.tag.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVideos = sampleVideos.filter(
    (video) =>
      video.hashtag.toLowerCase() === selectedHashtag.toLowerCase()
  );

  const openHashtag = (tag) => {
    setSelectedHashtag(tag);
    setSearch(tag);
  };

  const openVideo = (video) => {
    Alert.alert(
      video.title,
      'Connect this preview to the KONNEKT Watch video player.',
      [{ text: 'OK' }]
    );
  };

  const renderHashtag = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.hashtagCard,
        selectedHashtag === item.tag && styles.selectedCard,
      ]}
      onPress={() => openHashtag(item.tag)}
    >
      <View style={styles.hashtagIcon}>
        <Text style={styles.hashSymbol}>#</Text>
      </View>

      <View style={styles.hashtagInfo}>
        <Text style={styles.hashtagName}>#{item.tag}</Text>
        <Text style={styles.postCount}>
          {item.posts} videos · {item.category}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Explore hashtags</Text>

        <Text style={styles.headerIcon}>#</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search hashtags..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <Text style={styles.sectionTitle}>Trending hashtags</Text>
          <Text style={styles.trendingLabel}>🔥 Trending</Text>
        </View>

        {filteredHashtags.length === 0 ? (
          <Text style={styles.emptyText}>
            No matching hashtags found.
          </Text>
        ) : (
          <FlatList
            data={filteredHashtags}
            keyExtractor={(item) => item.id}
            renderItem={renderHashtag}
            scrollEnabled={false}
          />
        )}

        <View style={styles.videoHeading}>
          <Text style={styles.sectionTitle}>
            Videos for #{selectedHashtag}
          </Text>
        </View>

        {filteredVideos.length === 0 ? (
          <View style={styles.emptyVideo}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyText}>
              No posts found for this hashtag yet.
            </Text>
          </View>
        ) : (
          filteredVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.videoCard}
              onPress={() => openVideo(video)}
            >
              <View style={styles.videoThumbnail}>
                <Text style={styles.videoEmoji}>
                  {video.emoji}
                </Text>
                <Text style={styles.playIcon}>▶</Text>
              </View>

              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>
                  {video.title}
                </Text>
                <Text style={styles.creator}>
                  {video.creator}
                </Text>
                <Text style={styles.videoHashtag}>
                  #{video.hashtag}
                </Text>
                <Text style={styles.views}>
                  {video.views} views
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  searchIcon: {
    color: '#667085',
    fontSize: 22,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 43,
    color: '#17202A',
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  trendingLabel: {
    color: '#E76F00',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hashtagCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    padding: 12,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  selectedCard: {
    borderColor: '#075E54',
    backgroundColor: '#E8F4F1',
  },
  hashtagIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#E8F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hashSymbol: {
    color: '#075E54',
    fontSize: 21,
    fontWeight: 'bold',
  },
  hashtagInfo: {
    flex: 1,
    marginLeft: 11,
  },
  hashtagName: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postCount: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 4,
  },
  arrow: {
    color: '#98A2B3',
    fontSize: 23,
  },
  videoHeading: {
    marginTop: 18,
    marginBottom: 12,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  videoThumbnail: {
    width: 95,
    height: 115,
    backgroundColor: '#DCEFEA',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoEmoji: {
    fontSize: 35,
  },
  playIcon: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: '#00000055',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 18,
  },
  videoInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  videoTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 17,
  },
  creator: {
    color: '#667085',
    fontSize: 9,
    marginTop: 7,
  },
  videoHashtag: {
    color: '#075E54',
    fontSize: 10,
    marginTop: 7,
    fontWeight: 'bold',
  },
  views: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 5,
  },
  emptyVideo: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 35,
    marginBottom: 8,
  },
  emptyText: {
    color: '#98A2B3',
    fontSize: 11,
    textAlign: 'center',
    marginVertical: 15,
  },
});
