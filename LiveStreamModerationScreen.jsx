
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';

const initialViewers = [
  { id: '1', name: 'Thando M.', username: '@thando', role: 'Viewer', muted: false },
  { id: '2', name: 'Sipho K.', username: '@sipho', role: 'Viewer', muted: false },
  { id: '3', name: 'Lerato P.', username: '@lerato', role: 'Moderator', muted: false },
  { id: '4', name: 'Ayanda N.', username: '@ayanda', role: 'Viewer', muted: false },
];

const initialComments = [
  { id: '1', username: '@thando', message: 'This live is amazing!' },
  { id: '2', username: '@sipho', message: 'Greetings everyone!' },
  { id: '3', username: '@ayanda', message: 'Please play some music.' },
];

export default function LiveStreamModerationScreen({ navigation, route }) {
  const [viewers, setViewers] = useState(initialViewers);
  const [comments, setComments] = useState(initialComments);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [followersOnly, setFollowersOnly] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Viewers');

  const toggleMute = (id) => {
    setViewers(current =>
      current.map(viewer =>
        viewer.id === id
          ? { ...viewer, muted: !viewer.muted }
          : viewer
      )
    );
  };

  const removeViewer = (id) => {
    Alert.alert(
      'Remove viewer',
      'Remove this viewer from the live session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setViewers(current =>
              current.filter(viewer => viewer.id !== id)
            );
          },
        },
      ]
    );
  };

  const toggleModerator = (id) => {
    setViewers(current =>
      current.map(viewer =>
        viewer.id === id
          ? {
              ...viewer,
              role: viewer.role === 'Moderator' ? 'Viewer' : 'Moderator',
            }
          : viewer
      )
    );
  };

  const removeComment = (id) => {
    setComments(current =>
      current.filter(comment => comment.id !== id)
    );
  };

  const endLive = () => {
    Alert.alert(
      'End live stream?',
      'Are you sure you want to end this live session?',
      [
        { text: 'Continue streaming', style: 'cancel' },
        {
          text: 'End live',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('CreatorStudio');
          },
        },
      ]
    );
  };

  const renderViewer = (viewer) => (
    <View key={viewer.id} style={styles.personCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {viewer.name.charAt(0)}
        </Text>
      </View>

      <View style={styles.personInfo}>
        <Text style={styles.personName}>{viewer.name}</Text>
        <Text style={styles.username}>{viewer.username}</Text>
        <Text style={styles.role}>{viewer.role}</Text>
        {viewer.muted && (
          <Text style={styles.mutedLabel}>Muted</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => toggleModerator(viewer.id)}
        >
          <Text style={styles.smallButtonText}>
            {viewer.role === 'Moderator' ? 'Remove mod' : 'Make mod'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => toggleMute(viewer.id)}
        >
          <Text style={styles.smallButtonText}>
            {viewer.muted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeViewer(viewer.id)}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Live Moderation</Text>

        <Text style={styles.liveBadge}>● LIVE</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Stream control centre</Text>
        <Text style={styles.summaryDescription}>
          Manage viewers, comments and chat settings.
        </Text>

        <View style={styles.viewerCount}>
          <Text style={styles.viewerNumber}>{viewers.length}</Text>
          <Text style={styles.viewerLabel}>Sample viewers</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {['Viewers', 'Comments', 'Settings'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab)}
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

      {selectedTab === 'Viewers' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            People watching
          </Text>

          {viewers.length === 0 ? (
            <Text style={styles.emptyText}>
              No viewers in this sample list.
            </Text>
          ) : (
            viewers.map(renderViewer)
          )}
        </View>
      )}

      {selectedTab === 'Comments' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Live chat comments
          </Text>

          {comments.length === 0 ? (
            <Text style={styles.emptyText}>
              No comments available.
            </Text>
          ) : (
            comments.map(comment => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentInfo}>
                  <Text style={styles.commentUser}>
                    {comment.username}
                  </Text>
                  <Text style={styles.commentMessage}>
                    {comment.message}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeComment(comment.id)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {selectedTab === 'Settings' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Chat permissions
          </Text>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable live chat</Text>
              <Text style={styles.settingDescription}>
                Allow viewers to send comments.
              </Text>
            </View>
            <Switch
              value={chatEnabled}
              onValueChange={setChatEnabled}
              trackColor={{ true: '#075E54' }}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Followers only</Text>
              <Text style={styles.settingDescription}>
                Restrict chat to your followers.
              </Text>
            </View>
            <Switch
              value={followersOnly}
              onValueChange={setFollowersOnly}
              trackColor={{ true: '#075E54' }}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Slow mode</Text>
              <Text style={styles.settingDescription}>
                Limit how frequently viewers can comment.
              </Text>
            </View>
            <Switch
              value={slowMode}
              onValueChange={setSlowMode}
              trackColor={{ true: '#075E54' }}
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() =>
              Alert.alert(
                'Demo settings',
                'These settings are local only and are not yet applied to a live server.'
              )
            }
          >
            <Text style={styles.saveText}>Save settings</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.endButton}
        onPress={endLive}
      >
        <Text style={styles.endButtonText}>
          END LIVE STREAM
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Demo moderation only. Real viewer controls, chat restrictions
        and moderation permissions require backend integration.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  liveBadge: {
    color: '#FFFFFF',
    backgroundColor: '#D92D20',
    padding: 6,
    borderRadius: 5,
    fontSize: 9,
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 17,
    borderRadius: 12,
  },
  summaryTitle: {
    color: '#17202A',
    fontSize: 15,
    fontWeight: 'bold',
  },
  summaryDescription: {
    color: '#667085',
    fontSize: 10,
    marginTop: 6,
  },
  viewerCount: {
    marginTop: 15,
    alignItems: 'center',
    backgroundColor: '#E8F4F1',
    padding: 13,
    borderRadius: 9,
  },
  viewerNumber: {
    color: '#075E54',
    fontSize: 25,
    fontWeight: 'bold',
  },
  viewerLabel: {
    color: '#667085',
    fontSize: 10,
    marginTop: 3,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
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
  section: {
    margin: 14,
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  personCard: {
    backgroundColor: '#FFFFFF',
    padding: 11,
    borderRadius: 10,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 39,
    height: 39,
    borderRadius: 22,
    backgroundColor: '#E8F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#075E54',
    fontWeight: 'bold',
  },
  personInfo: {
    flex: 1,
    marginLeft: 9,
  },
  personName: {
    color: '#17202A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  username: {
    color: '#667085',
    fontSize: 9,
    marginTop: 3,
  },
  role: {
    color: '#075E54',
    fontSize: 9,
    marginTop: 3,
  },
  mutedLabel: {
    color: '#D92D20',
    fontSize: 9,
    marginTop: 2,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 5,
  },
  smallButton: {
    backgroundColor: '#E8F4F1',
    padding: 6,
    borderRadius: 5,
  },
  smallButtonText: {
    color: '#075E54',
    fontSize: 8,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 5,
  },
  removeText: {
    color: '#D92D20',
    fontSize: 9,
    fontWeight: 'bold',
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 9,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInfo: {
    flex: 1,
  },
  commentUser: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  commentMessage: {
    color: '#17202A',
    fontSize: 11,
    marginTop: 5,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  settingDescription: {
    color: '#667085',
    fontSize: 9,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#075E54',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  endButton: {
    backgroundColor: '#D92D20',
    marginHorizontal: 14,
    marginTop: 10,
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#667085',
    fontSize: 11,
    textAlign: 'center',
    padding: 20,
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    margin: 18,
    lineHeight: 15,
  },
});
