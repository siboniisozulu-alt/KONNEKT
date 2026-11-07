
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

export default function ChatConversationScreen({ navigation, route }) {
  const chatName = route?.params?.chatName || 'KONNEKT Friend';

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Welcome to KONNEKT! 👋',
      sender: 'them',
      time: '10:00'
    },
    {
      id: '2',
      text: 'Thank you! Great to be here.',
      sender: 'me',
      time: '10:01'
    }
  ]);

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      text: trimmedMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(previous => [...previous, newMessage]);
    setMessage('');
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender === 'me';

    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.myRow : styles.theirRow
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myBubble : styles.theirBubble
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>

          <Text style={styles.messageTime}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.chatName}>{chatName}</Text>
          <Text style={styles.online}>KONNEKT conversation</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.messageList}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageContent}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          placeholderTextColor="#8A99AD"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
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
    backgroundColor: '#07111F'
  },
  header: {
    backgroundColor: '#14243A',
    padding: 15,
    paddingTop: 35,
    flexDirection: 'row',
    alignItems: 'center'
  },
  back: {
    color: '#00E5A8',
    fontSize: 32,
    marginRight: 12
  },
  headerInfo: {
    flex: 1
  },
  chatName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold'
  },
  online: {
    color: '#00E5A8',
    fontSize: 11,
    marginTop: 3
  },
  callIcon: {
    fontSize: 21,
    marginHorizontal: 12
  },
  moreIcon: {
    color: '#FFFFFF',
    fontSize: 25
  },
  messageList: {
    flex: 1
  },
  messageContent: {
    padding: 15,
    paddingBottom: 20
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  myRow: {
    justifyContent: 'flex-end'
  },
  theirRow: {
    justifyContent: 'flex-start'
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 14,
    padding: 12
  },
  myBubble: {
    backgroundColor: '#075C48',
    borderBottomRightRadius: 3
  },
  theirBubble: {
    backgroundColor: '#14243A',
    borderBottomLeftRadius: 3
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21
  },
  messageTime: {
    color: '#B8C4D4',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 6
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#14243A'
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#263A53',
    color: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 110,
    fontSize: 14
  },
  sendButton: {
    backgroundColor: '#00E5A8',
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  sendText: {
    color: '#07111F',
    fontSize: 22,
    fontWeight: 'bold'
  }
});
