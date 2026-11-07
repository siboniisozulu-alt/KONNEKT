
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

const initialComments = [
  {
    id: '1',
    name: 'Thando',
    username: '@thando_music',
    avatar: '🎵',
    message: 'This video is amazing! 🔥',
    likes: 24,
    liked: false,
    time: '2h ago',
  },
  {
    id: '2',
    name: 'Sipho',
    username: '@sipho_creates',
    avatar: '🎬',
    message: 'KONNEKT is going to be something special!',
    likes: 18,
    liked: true,
    time: '3h ago',
  },
  {
    id: '3',
    name: 'Lerato',
    username: '@lerato_za',
    avatar: '🌸',
    message: 'Love this content ❤️',
    likes: 12,
    liked: false,
    time: '5h ago',
  },
];

export default function CommentsScreen({ navigation, route }) {
  const videoTitle = route?.params?.videoTitle || 'KONNEKT video';

  const [comments, setComments] = useState(initialComments);
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const likeComment = (id) => {
    setComments((previous) =>
      previous.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked
                ? comment.likes - 1
                : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const sendComment = () => {
    if (!message.trim()) {
      return;
    }

    const newComment = {
      id: Date.now().toString(),
      name: 'You',
      username: '@your_username',
      avatar: '🙂',
      message: replyingTo
        ? `Reply to ${replyingTo.name}: ${message.trim()}`
        : message.trim(),
      likes: 0,
      liked: false,
      time: 'Just now',
    };

    setComments((previous) => [newComment, ...previous]);
    setMessage('');
    setReplyingTo(null);
  };

  const reportComment = (comment) => {
    Alert.alert(
      'Report comment',
      `Report the comment by ${comment.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () =>
            navigation.navigate('ReportContent', {
              contentType: 'Comment',
              contentId: comment.id,
              creatorName: comment.name,
            }),
        },
      ]
    );
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>

      <View style={styles.commentContent}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <Text style={styles.username}>{item.username}</Text>

        <Text style={styles.message}>{item.message}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => likeComment(item.id)}
          >
            <Text
              style={[
                styles.actionText,
                item.liked && styles.likedText,
              ]}
            >
              {item.liked ? '♥' : '♡'} {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setReplyingTo(item)}
          >
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => reportComment(item)}
          >
            <Text style={styles.actionText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Comments</Text>
          <Text style={styles.headerSubtitle}>
            {videoTitle}
          </Text>
        </View>

        <Text style={styles.headerIcon}>💬</Text>
      </View>

      <View style={styles.commentSummary}>
        <Text style={styles.summaryTitle}>All comments</Text>
        <Text style={styles.summaryCount}>
          {comments.length}
        </Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No comments yet. Be the first to comment!
          </Text>
        }
      />

      {replyingTo && (
        <View style={styles.replyBanner}>
          <Text style={styles.replyText}>
            Replying to {replyingTo.name}
          </Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Text style={styles.cancelReply}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.myAvatar}>
          <Text>🙂</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder={
            replyingTo ? 'Write your reply...' : 'Add a comment...'
          }
          placeholderTextColor="#98A2B3"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            !message.trim() && styles.sendDisabled,
          ]}
          onPress={sendComment}
          disabled={!message.trim()}
        >
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#075E54',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 13,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D1E7E1',
    fontSize: 9,
    marginTop: 3,
  },
  headerIcon: {
    fontSize: 21,
  },
  commentSummary: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  summaryTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryCount: {
    color: '#075E54',
    fontSize: 11,
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
    paddingBottom: 25,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  avatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#E8F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 19,
  },
  commentContent: {
    flex: 1,
    marginLeft: 11,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  time: {
    color: '#98A2B3',
    fontSize: 9,
    marginLeft: 9,
  },
  username: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 3,
  },
  message: {
    color: '#344054',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  actionText: {
    color: '#667085',
    fontSize: 10,
    marginRight: 20,
    fontWeight: '500',
  },
  likedText: {
    color: '#E31B54',
  },
  replyBanner: {
    backgroundColor: '#E8F4F1',
    paddingHorizontal: 15,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  replyText: {
    color: '#075E54',
    fontSize: 10,
  },
  cancelReply: {
    color: '#075E54',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
    backgroundColor: '#FFFFFF',
  },
  myAvatar: {
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: '#E8F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F4F7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    maxHeight: 90,
    color: '#17202A',
    fontSize: 11,
  },
  sendButton: {
    backgroundColor: '#075E54',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  emptyText: {
    color: '#98A2B3',
    textAlign: 'center',
    marginTop: 35,
    fontSize: 12,
  },
});
