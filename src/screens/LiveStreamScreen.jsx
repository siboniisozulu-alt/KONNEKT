
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

const startingComments = [
  {
    id: '1',
    username: 'Thando',
    message: 'Welcome! 🔥',
  },
  {
    id: '2',
    username: 'Lerato',
    message: 'We are watching!',
  },
  {
    id: '3',
    username: 'Sipho',
    message: 'Amazing live stream ❤️',
  },
];

const reactions = ['❤️', '🔥', '😂', '👏', '😍'];

export default function LiveStreamScreen({ navigation, route }) {
  const {
    title = 'Welcome to my live stream!',
    category = 'Entertainment',
    audience = 'Everyone',
    chatEnabled = true,
    commentsEnabled = true,
    isHost = true,
  } = route?.params || {};

  const [comments, setComments] = useState(startingComments);
  const [message, setMessage] = useState('');
  const [viewers, setViewers] = useState(128);
  const [following, setFollowing] = useState(false);
  const [likes, setLikes] = useState(245);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [chatVisible, setChatVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  };

  const sendComment = () => {
    if (!message.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      username: 'You',
      message: message.trim(),
    };

    setComments((previous) => [...previous, newComment]);
    setMessage('');
  };

  const sendReaction = (reaction) => {
    setLikes((previous) => previous + 1);

    Alert.alert(
      'Reaction sent',
      `You sent ${reaction}`
    );
  };

  const sendGift = () => {
    Alert.alert(
      'KONNEKT Gifts',
      'The gifts feature will be connected to the creator payment system.'
    );
  };

  const endLive = () => {
    Alert.alert(
      'End live stream?',
      'Are you sure you want to end this live session?',
      [
        {
          text: 'Continue streaming',
          style: 'cancel',
        },
        {
          text: 'End Live',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.videoArea}>
        <View style={styles.topBar}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>

          <View style={styles.viewerBadge}>
            <Text style={styles.viewerText}>
              👁 {viewers}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={endLive}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraIcon}>📹</Text>
          <Text style={styles.cameraTitle}>
            KONNEKT LIVE
          </Text>
          <Text style={styles.cameraSubtitle}>
            Your live video will appear here
          </Text>
        </View>

        <View style={styles.streamInfo}>
          <Text style={styles.streamTitle}>{title}</Text>
          <Text style={styles.streamCategory}>
            {category} • {formatTime(liveSeconds)}
          </Text>
        </View>

        <View style={styles.creatorRow}>
          <View style={styles.creatorAvatar}>
            <Text style={styles.creatorAvatarText}>👤</Text>
          </View>

          <View style={styles.creatorDetails}>
            <Text style={styles.creatorName}>KONNEKT Creator</Text>
            <Text style={styles.creatorLabel}>
              {audience} audience
            </Text>
          </View>

          {!isHost && (
            <TouchableOpacity
              style={styles.followButton}
              onPress={() => setFollowing(!following)}
            >
              <Text style={styles.followText}>
                {following ? 'Following' : '+ Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.reactionBar}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => setLikes((previous) => previous + 1)}
          >
            <Text style={styles.likeText}>
              ❤️ {likes}
            </Text>
          </TouchableOpacity>

          {reactions.map((reaction) => (
            <TouchableOpacity
              key={reaction}
              style={styles.reactionButton}
              onPress={() => sendReaction(reaction)}
            >
              <Text style={styles.reactionText}>
                {reaction}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.giftButton}
            onPress={sendGift}
          >
            <Text style={styles.giftText}>🎁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {chatVisible && chatEnabled && (
        <View style={styles.chatArea}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>
              Live chat
            </Text>

            <TouchableOpacity
              onPress={() => setChatVisible(false)}
            >
              <Text style={styles.hideChat}>Hide</Text>
            </TouchableOpacity>
          </View>

          {commentsEnabled ? (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.comment}>
                  <Text style={styles.commentUsername}>
                    {item.username}
                  </Text>

                  <Text style={styles.commentMessage}>
                    {item.message}
                  </Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.commentList}
            />
          ) : (
            <Text style={styles.disabledText}>
              Comments are disabled for this live stream.
            </Text>
          )}

          {commentsEnabled && (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Say something..."
                placeholderTextColor="#98A2B3"
                value={message}
                onChangeText={setMessage}
                maxLength={250}
              />

              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendComment}
              >
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {!chatVisible && chatEnabled && (
        <TouchableOpacity
          style={styles.showChatButton}
          onPress={() => setChatVisible(true)}
        >
          <Text style={styles.showChatText}>
            💬 Show live chat
          </Text>
        </TouchableOpacity>
      )}

      {isHost && (
        <TouchableOpacity
          style={styles.endButton}
          onPress={endLive}
        >
          <Text style={styles.endButtonText}>
            END LIVE STREAM
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  videoArea: {
    flex: 1.15,
    backgroundColor: '#172522',
    paddingHorizontal: 14,
    paddingTop: 42,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveBadge: {
    backgroundColor: '#D92D20',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 7,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewerBadge: {
    backgroundColor: '#34413E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewerText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  closeButton: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#34413E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 65,
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 12,
    letterSpacing: 2,
  },
  cameraSubtitle: {
    color: '#AABAB5',
    fontSize: 11,
    marginTop: 7,
  },
  streamInfo: {
    marginBottom: 12,
  },
  streamTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  streamCategory: {
    color: '#B7C5C1',
    fontSize: 10,
    marginTop: 5,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#40534E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarText: {
    fontSize: 20,
  },
  creatorDetails: {
    flex: 1,
    marginLeft: 10,
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  creatorLabel: {
    color: '#AABAB5',
    fontSize: 9,
    marginTop: 4,
  },
  followButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  followText: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    backgroundColor: '#34413E',
    padding: 8,
    borderRadius: 18,
  },
  likeText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  reactionButton: {
    padding: 5,
  },
  reactionText: {
    fontSize: 20,
  },
  giftButton: {
    backgroundColor: '#34413E',
    padding: 8,
    borderRadius: 18,
  },
  giftText: {
    fontSize: 17,
  },
  chatArea: {
    flex: 0.85,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  chatTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  hideChat: {
    color: '#075E54',
    fontSize: 11,
  },
  commentList: {
    paddingVertical: 8,
  },
  comment: {
    marginBottom: 10,
  },
  commentUsername: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  commentMessage: {
    color: '#475467',
    fontSize: 11,
  },
  disabledText: {
    color: '#667085',
    fontSize: 11,
    paddingVertical: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F2F4F7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 11,
    color: '#17202A',
  },
  sendButton: {
    backgroundColor: '#075E54',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginLeft: 7,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  showChatButton: {
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#34413E',
    borderRadius: 20,
    margin: 10,
  },
  showChatText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  endButton: {
    backgroundColor: '#D92D20',
    margin: 12,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
