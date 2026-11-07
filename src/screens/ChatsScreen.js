
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from 'react-native';

const sampleChats = [
  {
    id: '1',
    name: 'Thabo',
    message: 'Hey, how are you?',
    time: '10:30',
    unread: 2,
    avatar: '👨🏽'
  },
  {
    id: '2',
    name: 'Lerato',
    message: 'See you later!',
    time: '09:45',
    unread: 0,
    avatar: '👩🏽'
  },
  {
    id: '3',
    name: 'KONNEKT Friends',
    message: 'Welcome to the group!',
    time: 'Yesterday',
    unread: 4,
    avatar: '👥'
  }
];

export default function ChatsScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const filteredChats = sampleChats.filter(chat =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderChat = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('ChatConversation', {
          chatId: item.id,
          chatName: item.name
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>

      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.message}
        </Text>
      </View>

      <View style={styles.chatMeta}>
        <Text style={styles.time}>{item.time}</Text>

        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('NewChat')
          }
        >
          <Text style={styles.newChat}>＋</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search conversations..."
        placeholderTextColor="#8A99AD"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredChats}
        keyExtractor={item => item.id}
        renderItem={renderChat}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No conversations found.
          </Text>
        }
      />

      <Text style={styles.notice}>
        Your real conversations will appear here after backend integration.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold'
  },
  newChat: {
    color: '#00E5A8',
    fontSize: 35,
    fontWeight: 'bold'
  },
  search: {
    backgroundColor: '#14243A',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    marginBottom: 15
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#263A53'
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#14243A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13
  },
  avatarText: {
    fontSize: 25
  },
  chatDetails: {
    flex: 1
  },
  chatName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  lastMessage: {
    color: '#8A99AD',
    fontSize: 13,
    marginTop: 5
  },
  chatMeta: {
    alignItems: 'flex-end'
  },
  time: {
    color: '#8A99AD',
    fontSize: 11
  },
  unreadBadge: {
    backgroundColor: '#00E5A8',
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7
  },
  unreadText: {
    color: '#07111F',
    fontSize: 11,
    fontWeight: 'bold'
  },
  emptyText: {
    color: '#8A99AD',
    textAlign: 'center',
    marginTop: 40
  },
  notice: {
    color: '#8A99AD',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 12
  }
});
