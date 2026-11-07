
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

const sampleArchivedChats = [
  {
    id: '1',
    name: 'Thabo Mokoena',
    message: 'See you tomorrow!',
    time: '09:15',
    unread: 0,
    online: true,
  },
  {
    id: '2',
    name: 'KONNEKT Business Group',
    message: 'New business opportunity shared.',
    time: 'Yesterday',
    unread: 3,
    online: false,
  },
  {
    id: '3',
    name: 'Lerato Nkosi',
    message: 'Thank you for your help.',
    time: 'Monday',
    unread: 0,
    online: false,
  },
  {
    id: '4',
    name: 'Sipho Dlamini',
    message: 'Send me the details when ready.',
    time: 'Sunday',
    unread: 0,
    online: false,
  },
];

export default function ArchivedChatsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState(sampleArchivedChats);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase()) ||
    chat.message.toLowerCase().includes(search.toLowerCase())
  );

  const unarchiveChat = (chat) => {
    Alert.alert(
      'Unarchive conversation?',
      `Move ${chat.name} back to your main Chats list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unarchive',
          onPress: () => {
            setChats((previous) =>
              previous.filter((item) => item.id !== chat.id)
            );

            Alert.alert(
              'Conversation unarchived',
              'This demo removes it from the archived list. Backend syncing is not connected yet.'
            );
          },
        },
      ]
    );
  };

  const openChat = (chat) => {
    navigation.navigate('ChatConversation', {
      contact: { name: chat.name },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Archived chats</Text>
          <Text style={styles.headerSubtitle}>
            Conversations you've archived
          </Text>
        </View>

        <Text style={styles.archiveIcon}>📦</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search archived chats..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Archived conversations are hidden from your main Chats list.
          You can unarchive them whenever you want.
        </Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          ARCHIVED ({filteredChats.length})
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatList}>
        {filteredChats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>
              No archived chats found
            </Text>
            <Text style={styles.emptyText}>
              Archived conversations will appear here.
            </Text>
          </View>
        ) : (
          filteredChats.map((chat) => (
            <View key={chat.id} style={styles.chatCard}>
              <TouchableOpacity
                style={styles.chatMain}
                onPress={() => openChat(chat)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {chat.name.charAt(0)}
                  </Text>
                  {chat.online && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.chatTop}>
                    <Text style={styles.chatName} numberOfLines={1}>
                      {chat.name}
                    </Text>
                    <Text style={styles.chatTime}>{chat.time}</Text>
                  </View>

                  <View style={styles.chatBottom}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {chat.message}
                    </Text>

                    {chat.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {chat.unread}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.unarchiveButton}
                onPress={() => unarchiveChat(chat)}
              >
                <Text style={styles.unarchiveIcon}>↩</Text>
                <Text style={styles.unarchiveText}>Restore</Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  back: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 10,
    marginTop: 3,
  },
  archiveIcon: {
    fontSize: 24,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  searchIcon: {
    fontSize: 17,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    color: '#17202A',
    fontSize: 13,
  },
  infoBanner: {
    backgroundColor: '#EAF2F1',
    flexDirection: 'row',
    padding: 13,
    marginHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 17,
    marginRight: 9,
  },
  infoText: {
    flex: 1,
    color: '#526B67',
    fontSize: 11,
    lineHeight: 17,
  },
  listHeader: {
    marginHorizontal: 17,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chatList: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  chatMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: '#D9EEE9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#075E54',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineDot: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#25D366',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
  },
  chatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    flex: 1,
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 8,
  },
  chatTime: {
    color: '#98A2B3',
    fontSize: 10,
  },
  chatBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
  },
  lastMessage: {
    flex: 1,
    color: '#667085',
    fontSize: 11,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    minWidth: 19,
    height: 19,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unarchiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EAF2F1',
    borderRadius: 20,
  },
  unarchiveIcon: {
    color: '#075E54',
    fontSize: 15,
    marginRight: 5,
  },
  unarchiveText: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 70,
  },
  emptyIcon: {
    fontSize: 45,
  },
  emptyTitle: {
    color: '#17202A',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyText: {
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 6,
  },
});
