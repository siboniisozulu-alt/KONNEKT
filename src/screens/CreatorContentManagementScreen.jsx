
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const initialVideos = [];

const initialDrafts = [];

export default function CreatorContentManagementScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Published');
  const [videos, setVideos] = useState(initialVideos);
  const [drafts, setDrafts] = useState(initialDrafts);

  const deleteVideo = (video) => {
    Alert.alert(
      'Delete video',
      `Remove "${video.title}" from your content list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setVideos(current =>
              current.filter(item => item.id !== video.id)
            );
          },
        },
      ]
    );
  };

  const deleteDraft = (draft) => {
    Alert.alert(
      'Delete draft',
      `Delete "${draft.title}" from your drafts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDrafts(current =>
              current.filter(item => item.id !== draft.id)
            );
          },
        },
      ]
    );
  };

  const editCaption = (video) => {
    Alert.alert(
      'Edit caption',
      'Caption editing will be connected to the content database in a future version.'
    );
  };

  const changeVisibility = (video) => {
    Alert.alert(
      'Content visibility',
      `Current visibility: ${video.visibility}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make public',
          onPress: () => {
            setVideos(current =>
              current.map(item =>
                item.id === video.id
                  ? { ...item, visibility: 'Public' }
                  : item
              )
            );
          },
        },
        {
          text: 'Make private',
          onPress: () => {
            setVideos(current =>
              current.map(item =>
                item.id === video.id
                  ? { ...item, visibility: 'Private' }
                  : item
              )
            );
          },
        },
      ]
    );
  };

  const renderVideo = (video) => (
    <View key={video.id} style={styles.videoCard}>
      <View style={styles.videoTop}>
        <View style={styles.thumbnail}>
          <Text style={styles.thumbnailEmoji}>{video.emoji}</Text>
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.videoCategory}>{video.category}</Text>
          <Text style={styles.visibility}>
            Visibility: {video.visibility}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>▶ {video.views} views</Text>
        <Text style={styles.stat}>♥ {video.likes}</Text>
        <Text style={styles.stat}>💬 {video.comments}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => editCaption(video)}
        >
          <Text style={styles.actionText}>Edit caption</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => changeVisibility(video)}
        >
          <Text style={styles.actionText}>Visibility</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteVideo(video)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
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

        <Text style={styles.headerTitle}>My Content</Text>
        <Text style={styles.headerIcon}>🎞️</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Creator Content Studio</Text>
        <Text style={styles.heroDescription}>
          Manage your videos, review performance and organise
          your content in one place.
        </Text>
        <Text style={styles.previewLabel}>CONTENT MANAGEMENT PREVIEW</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{videos.length}</Text>
          <Text style={styles.summaryLabel}>Published</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{drafts.length}</Text>
          <Text style={styles.summaryLabel}>Drafts</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>2.4K</Text>
          <Text style={styles.summaryLabel}>Sample views</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {['Published', 'Drafts'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Published' && (
        <>
          <Text style={styles.sectionTitle}>Published videos</Text>

          {videos.length === 0 ? (
            <Text style={styles.emptyText}>
              You have not published any videos yet.
            </Text>
          ) : (
            videos.map(renderVideo)
          )}
        </>
      )}

      {activeTab === 'Drafts' && (
        <>
          <Text style={styles.sectionTitle}>Saved drafts</Text>

          {drafts.length === 0 ? (
            <Text style={styles.emptyText}>
              No draft examples are available.
            </Text>
          ) : (
            drafts.map(draft => (
              <View key={draft.id} style={styles.draftCard}>
                <Text style={styles.draftEmoji}>{draft.emoji}</Text>

                <View style={styles.draftInfo}>
                  <Text style={styles.draftTitle}>{draft.title}</Text>
                  <Text style={styles.draftCategory}>
                    {draft.category} · Draft
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => deleteDraft(draft)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </>
      )}

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Prototype information</Text>
        <Text style={styles.noticeText}>
          Your published content and drafts will appear here when connected. Changes
          happen only inside this screen and are not saved to a
          permanent account or server.
        </Text>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 20,
  },
  hero: {
    backgroundColor: '#075E54',
    margin: 14,
    padding: 21,
    borderRadius: 12,
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  heroDescription: {
    color: '#D1E7E3',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  previewLabel: {
    backgroundColor: '#FFFFFF',
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 13,
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    paddingVertical: 17,
    borderRadius: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    color: '#075E54',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: '#667085',
    fontSize: 9,
    marginTop: 5,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 15,
    padding: 4,
    borderRadius: 9,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 11,
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
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 11,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 11,
    padding: 13,
    borderRadius: 10,
  },
  videoTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 62,
    height: 72,
    backgroundColor: '#E8F4F1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: {
    fontSize: 30,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  videoTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  videoCategory: {
    color: '#667085',
    fontSize: 9,
    marginTop: 5,
  },
  visibility: {
    color: '#075E54',
    fontSize: 9,
    marginTop: 7,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAECF0',
    paddingVertical: 11,
    marginTop: 12,
  },
  stat: {
    color: '#475467',
    fontSize: 9,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 11,
  },
  actionButton: {
    backgroundColor: '#E8F4F1',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 6,
  },
  actionText: {
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FEF3F2',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 6,
  },
  deleteText: {
    color: '#B42318',
    fontSize: 9,
    fontWeight: 'bold',
  },
  draftCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 9,
    padding: 14,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftEmoji: {
    fontSize: 27,
    marginRight: 12,
  },
  draftInfo: {
    flex: 1,
  },
  draftTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  draftCategory: {
    color: '#667085',
    fontSize: 9,
    marginTop: 5,
  },
  emptyText: {
    color: '#667085',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 20,
    borderRadius: 9,
    textAlign: 'center',
    fontSize: 10,
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
});
