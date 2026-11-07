
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';

const initialMessages = [
  {
    id: '1',
    username: 'Thando',
    message: 'This live is amazing! 🔥',
    likes: 4,
    moderator: false,
  },
  {
    id: '2',
    username: 'Lerato',
    message: 'Greetings from Durban ❤️',
    likes: 7,
    moderator: false,
  },
  {
    id: '3',
    username: 'KONNEKT Admin',
    message: 'Welcome everyone. Please respect each other.',
    likes: 12,
    moderator: true,
  },
  {
    id: '4',
    username: 'Sipho',
    message: 'Keep creating great content!',
    likes: 2,
    moderator: false,
  },
];

export default function LiveStreamChatScreen({ navigation, route }) {
  const { isModerator = false } = route?.params || {};

  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: message.trim(),
      likes: 0,
      moderator: false,
    };

    setMessages((previous) => [...previous, newMessage]);
    setMessage('');
  };

  const likeMessage = (id) => {
    setMessages((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, likes: item.likes + 1 }
          : item
      )
    );
  };

  const reportMessage = (item) => {
    Alert.alert(
      'Report comment',
      `Would you like to report ${item.username}'s comment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Demo report',
              'Reporting will work once the KONNEKT moderation backend is connected.'
            ),
        },
      ]
    );
  };

  const removeMessage = (id) => {
    Alert.alert(
      'Remove comment',
      'Remove this comment from the chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            setMessages((previous) =>
              previous.filter((item) => item.id !== id)
            ),
        },
      ]
    );
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageCard}>
      <View style={styles.messageTop}>
        <View style={styles.userInfo}>
          <Text style={styles.avatar}>👤</Text>

          <View>
            <View style={styles.nameRow}>
              <Text style={styles.username}>
                {item.username}
              </Text>

              {item.moderator && (
                <Text style={styles.modBadge}>
                  MOD
                </Text>
              )}
            </View>

            <Text style={styles.messageText}>
              {item.message}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => likeMessage(item.id)}
          >
            <Text style={styles.like}>
              ❤️ {item.likes}
            </Text>
          </TouchableOpacity>

          {isModerator && item.username !== 'You' && (
            <TouchableOpacity
              onPress={() => removeMessage(item.id)}
            >
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => reportMessage(item)}
          >
            <Text style={styles.report}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Live Chat</Text>
          <Text style={styles.subtitle}>
            Join the conversation
          </Text>
        </View>

        <Text style={styles.liveBadge}>● LIVE</Text>
      </View>

      <View style={styles.chatInfo}>
        <Text style={styles.chatInfoText}>
          💬 {messages.length} messages in this demo
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          placeholderTextColor="#98A2B3"
          value={message}
          onChangeText={setMessage}
          maxLength={250}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Keep KONNEKT friendly. Harassment and harmful content are not allowed.
      </Text>
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
    padding: 17,
    paddingTop: 45,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 30,
    marginRight: 15,
  },
  headerCenter: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#D1E7E1',
    fontSize: 10,
    marginTop: 3,
  },
  liveBadge: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#D92D20',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
  },
  chatInfo: {
    padding: 12,
    backgroundColor: '#E8F4F1',
  },
  chatInfoText: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  list: {
    padding: 13,
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  messageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    fontSize: 23,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modBadge: {
    backgroundColor: '#075E54',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 6,
  },
  messageText: {
    color: '#475467',
    fontSize: 11,
    marginTop: 6,
    lineHeight: 17,
  },
  actions: {
    alignItems: 'flex-end',
    marginLeft: 5,
  },
  like: {
    color: '#D92D20',
    fontSize: 10,
  },
  remove: {
    color: '#D92D20',
    fontSize: 9,
    marginTop: 9,
  },
  report: {
    color: '#667085',
    fontSize: 9,
    marginTop: 9,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 20,
    color: '#17202A',
    fontSize: 11,
  },
  sendButton: {
    backgroundColor: '#075E54',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    color: '#98A2B3',
    textAlign: 'center',
    fontSize: 9,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
});
