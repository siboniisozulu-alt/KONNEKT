
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const initialMessages = [];

export default function GroupChatScreen({ navigation, route }) {
  const group = route?.params?.group || {
    id: '',
    name: route?.params?.groupName || 'Group',
    members: [],
  };

  const [messages, setMessages] = useState(
    route?.params?.messages || []
  );

  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    const text = messageText.trim();

    if (!text) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      mine: true,
    };

    setMessages((previous) => [...previous, newMessage]);
    setMessageText('');

    if (route?.params?.onSendMessage) {
      route.params.onSendMessage(newMessage, group);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageRow,
        item.mine ? styles.myMessageRow : styles.otherMessageRow,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.mine ? styles.myBubble : styles.otherBubble,
        ]}
      >
        {!item.mine && (
          <Text style={styles.senderName}>
            {item.sender || 'Group Member'}
          </Text>
        )}

        <Text
          style={[
            styles.messageText,
            item.mine && styles.myMessageText,
          ]}
        >
          {item.text}
        </Text>

        <Text
          style={[
            styles.messageTime,
            item.mine && styles.myMessageTime,
          ]}
        >
          {item.time}
        </Text>
      </View>
    </View>
  );

  const openGroupInfo = () => {
    navigation.navigate('GroupInfo', { group });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.groupHeader}
          onPress={openGroupInfo}
        >
          <View style={styles.groupAvatar}>
            <Text style={styles.groupAvatarText}>👥</Text>
          </View>

          <View style={styles.groupDetails}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.memberCount}>
              {group.members?.length || 0} members
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('GroupInfo', { group })}
        >
          <Text style={styles.moreButton}>•••</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No messages yet. Start the conversation!
          </Text>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Message group..."
          placeholderTextColor="#888888"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={2000}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  header: {
    height: 65,
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 30,
    paddingHorizontal: 7,
  },
  groupHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  groupAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D5F5E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatarText: {
    fontSize: 20,
  },
  groupDetails: {
    marginLeft: 10,
  },
  groupName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  memberCount: {
    color: '#D5EAE7',
    fontSize: 11,
    marginTop: 3,
  },
  moreButton: {
    color: '#FFFFFF',
    fontSize: 19,
    paddingHorizontal: 8,
  },
  messageList: {
    padding: 12,
    paddingBottom: 18,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 10,
    borderRadius: 12,
    minWidth: 100,
  },
  myBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 3,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 3,
  },
  senderName: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    color: '#17202A',
    fontSize: 15,
    lineHeight: 21,
  },
  myMessageText: {
    color: '#17202A',
  },
  messageTime: {
    color: '#667085',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 5,
  },
  myMessageTime: {
    color: '#52745B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    padding: 9,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F2F4F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#17202A',
    maxHeight: 110,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#667085',
    textAlign: 'center',
    marginTop: 40,
  },
});
