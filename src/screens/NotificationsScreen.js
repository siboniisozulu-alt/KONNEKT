
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const initialNotifications = [
  {
    id: '1',
    type: 'like',
    name: 'Thando Music',
    avatar: '🎵',
    message: 'liked your video.',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    name: 'Sipho Creates',
    avatar: '🎬',
    message: 'commented: Amazing content! 🔥',
    time: '15 minutes ago',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    name: 'Lerato',
    avatar: '🌸',
    message: 'started following you.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '4',
    type: 'mention',
    name: 'Kasi Comedy',
    avatar: '😂',
    message: 'mentioned you in a comment.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'live',
    name: 'Musa ZA',
    avatar: '🔥',
    message: 'is live now. Join the stream!',
    time: 'Yesterday',
    read: true,
  },
];

const filters = [
  'All',
  'Likes',
  'Comments',
  'Follows',
  'Mentions',
  'Live',
];

const typeIcons = {
  like: '❤️',
  comment: '💬',
  follow: '👥',
  mention: '@',
  live: '🔴',
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [activeFilter, setActiveFilter] = useState('All');

  const getFilterType = (filter) => {
    const types = {
      Likes: 'like',
      Comments: 'comment',
      Follows: 'follow',
      Mentions: 'mention',
      Live: 'live',
    };

    return types[filter];
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'All') return true;

    return item.type === getFilterType(activeFilter);
  });

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const markAllRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  const markRead = (id) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, read: true }
          : item
      )
    );
  };

  const openNotification = (item) => {
    markRead(item.id);

    switch (item.type) {
      case 'follow':
        navigation.navigate('Followers');
        break;

      case 'comment':
        navigation.navigate('Comments');
        break;

      case 'like':
        navigation.navigate('Profile');
        break;

      case 'live':
        navigation.navigate('Watch');
        break;

      case 'mention':
        navigation.navigate('Comments');
        break;

      default:
        break;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard,
      ]}
      onPress={() => openNotification(item)}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{item.avatar}</Text>

        <View style={styles.typeIcon}>
          <Text style={styles.typeIconText}>
            {typeIcons[item.type]}
          </Text>
        </View>
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.message}>
          <Text style={styles.name}>{item.name} </Text>
          {item.message}
        </Text>

        <Text style={styles.time}>{item.time}</Text>
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('NotificationSettings')
          }
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryTitle}>
            Your notifications
          </Text>

          <Text style={styles.summarySubtitle}>
            {unreadCount} unread notifications
          </Text>
        </View>

        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => {
          const selected = activeFilter === filter;

          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterButton,
                selected && styles.filterSelected,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Recent activity
        </Text>
      </View>

      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>

          <Text style={styles.emptyTitle}>
            Nothing here yet
          </Text>

          <Text style={styles.emptyText}>
            New activity will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },
  settingsIcon: {
    fontSize: 21,
  },
  summary: {
    padding: 17,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  summarySubtitle: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 5,
  },
  markRead: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterScroll: {
    maxHeight: 55,
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: '#F2F4F7',
    borderRadius: 20,
    marginRight: 8,
  },
  filterSelected: {
    backgroundColor: '#075E54',
  },
  filterText: {
    color: '#667085',
    fontSize: 10,
    fontWeight: '500',
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    padding: 16,
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 13,
    paddingBottom: 25,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  unreadCard: {
    backgroundColor: '#F0F8F5',
    borderColor: '#C8E5DA',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E8F4F1',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 22,
    overflow: 'hidden',
  },
  typeIcon: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#FFFFFF',
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  typeIconText: {
    fontSize: 10,
  },
  notificationContent: {
    flex: 1,
  },
  message: {
    color: '#475467',
    fontSize: 11,
    lineHeight: 17,
  },
  name: {
    color: '#17202A',
    fontWeight: 'bold',
  },
  time: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#075E54',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  emptyIcon: {
    fontSize: 43,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 7,
  },
});
