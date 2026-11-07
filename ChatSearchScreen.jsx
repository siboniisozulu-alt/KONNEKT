
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

const sampleMessages = [];

export default function ChatSearchScreen({ navigation, route }) {
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
  };

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Photos', 'Videos', 'Documents', 'Links'];

  const filteredMessages = sampleMessages.filter((item) => {
    const matchesSearch =
      item.message.toLowerCase().includes(search.toLowerCase()) ||
      item.sender.toLowerCase().includes(search.toLowerCase());

    // Search results are supplied by the conversation history.
    const matchesFilter = filter === 'All';

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Search conversation
          </Text>
          <Text style={styles.headerSubtitle}>
            {contact.name}
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
          autoFocus
        />

        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
      >
        {filters.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterButton,
              filter === item && styles.activeFilter,
            ]}
            onPress={() => setFilter(item)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.activeFilterText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultsTitle}>
        {search.length > 0
          ? `${filteredMessages.length} matching messages`
          : 'RECENT MESSAGES'}
      </Text>

      <ScrollView contentContainerStyle={styles.resultsList}>
        {filteredMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyTitle}>
              No messages found
            </Text>
            <Text style={styles.emptyText}>
              Try another search word or phrase.
            </Text>
          </View>
        ) : (
          filteredMessages.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.messageCard}
              onPress={() => {
                navigation.navigate('ChatConversation', {
                  contact,
                  messageId: item.id,
                });
              }}
            >
              <View style={styles.messageTop}>
                <Text style={styles.sender}>{item.sender}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>

              <Text style={styles.messageText}>
                {item.message}
              </Text>
            </TouchableOpacity>
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
    fontSize: 11,
    marginTop: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 15,
    paddingHorizontal: 13,
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
  clearButton: {
    color: '#667085',
    fontSize: 17,
    padding: 5,
  },
  filterScroll: {
    maxHeight: 45,
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignSelf: 'flex-start',
  },
  activeFilter: {
    backgroundColor: '#075E54',
  },
  filterText: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  resultsTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginHorizontal: 17,
    marginTop: 20,
    marginBottom: 10,
  },
  resultsList: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  messageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sender: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    color: '#98A2B3',
    fontSize: 10,
  },
  messageText: {
    color: '#17202A',
    fontSize: 13,
    lineHeight: 19,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 65,
  },
  emptyIcon: {
    fontSize: 42,
  },
  emptyTitle: {
    color: '#17202A',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyText: {
    color: '#667085',
    fontSize: 12,
    marginTop: 6,
  },
});
