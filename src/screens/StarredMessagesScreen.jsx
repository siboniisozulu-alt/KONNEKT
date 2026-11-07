
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

const sampleStarredMessages = [];

export default function StarredMessagesScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState([]);

  const filteredMessages = messages.filter((item) =>
    item.message.toLowerCase().includes(search.toLowerCase()) ||
    item.contact.toLowerCase().includes(search.toLowerCase())
  );

  const removeStar = (id) => {
    Alert.alert(
      'Remove starred message?',
      'This message will be removed from your saved messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMessages((previous) =>
              previous.filter((item) => item.id !== id)
            );
          },
        },
      ]
    );
  };

  const openConversation = (item) => {
    navigation.navigate('ChatConversation', {
      contact: { name: item.contact },
      messageId: item.id,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Starred messages</Text>
          <Text style={styles.headerSubtitle}>
            Your important saved messages
          </Text>
        </View>

        <Text style={styles.starIcon}>★</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved messages..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>
        SAVED MESSAGES ({filteredMessages.length})
      </Text>

      <ScrollView contentContainerStyle={styles.messageList}>
        {filteredMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>★</Text>
            <Text style={styles.emptyTitle}>
              No starred messages
            </Text>
            <Text style={styles.emptyText}>
              Messages you star in your chats will appear here.
            </Text>
          </View>
        ) : (
          filteredMessages.map((item) => (
            <View key={item.id} style={styles.messageCard}>
              <TouchableOpacity
                style={styles.messageContent}
                onPress={() => openConversation(item)}
              >
                <View style={styles.messageHeader}>
                  <Text style={styles.contactName}>
                    {item.contact}
                  </Text>
                  <Text style={styles.messageDate}>
                    {item.date}
                  </Text>
                </View>

                <Text style={styles.messageText}>
                  {item.message}
                </Text>

                <View style={styles.messageFooter}>
                  <Text style={styles.typeLabel}>{item.type}</Text>
                  <Text style={styles.openLabel}>
                    Open conversation →
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeStar(item.id)}
              >
                <Text style={styles.removeIcon}>★</Text>
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
  starIcon: {
    color: '#FFD166',
    fontSize: 25,
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
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginHorizontal: 17,
    marginBottom: 10,
  },
  messageList: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  contactName: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageDate: {
    color: '#98A2B3',
    fontSize: 9,
  },
  messageText: {
    color: '#17202A',
    fontSize: 13,
    lineHeight: 19,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  typeLabel: {
    color: '#98A2B3',
    fontSize: 10,
  },
  openLabel: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 10,
    marginLeft: 5,
  },
  removeIcon: {
    color: '#E5A000',
    fontSize: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 80,
  },
  emptyIcon: {
    color: '#D5A928',
    fontSize: 55,
  },
  emptyTitle: {
    color: '#17202A',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptyText: {
    color: '#98A2B3',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },
});
