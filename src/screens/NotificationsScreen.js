
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const initialNotifications = [
  {
    id: '1',
    icon: '💬',
    title: 'New message',
    description: 'Sarah sent you a message.',
    time: '2 minutes ago',
    type: 'Messages',
    read: false,
  },
  {
    id: '2',
    icon: '❤️',
    title: 'Someone liked your video',
    description: 'Thabo liked your latest video.',
    time: '15 minutes ago',
    type: 'Videos',
    read: false,
  },
  {
    id: '3',
    icon: '👤',
    title: 'New follower',
    description: 'Lerato started following you.',
    time: '1 hour ago',
    type: 'Followers',
    read: false,
  },
  {
    id: '4',
    icon: '📸',
    title: 'Status reaction',
    description: 'A friend reacted to your status.',
    time: '3 hours ago',
    type: 'Statuses',
    read: true,
  },
  {
    id: '5',
    icon: '🔴',
    title: 'Live stream reminder',
    description: 'A creator you follow is going live.',
    time: 'Yesterday',
    type: 'Live',
    read: true,
  },
  {
    id: '6',
    icon: '🛡️',
    title: 'Security reminder',
    description: 'Review your account security settings.',
    time: 'Yesterday',
    type: 'Account',
    read: true,
  },
];

const filters = [
  'All',
  'Messages',
  'Videos',
  'Followers',
  'Statuses',
  'Live',
  'Account',
];

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredNotifications = notifications.filter((item) => {
    return (
      selectedFilter === 'All' ||
      item.type === selectedFilter
    );
  });

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const openNotification = (item) => {
    markAsRead(item.id);

    if (item.type === 'Messages') {
      navigation.navigate('Chats');
    } else if (item.type === 'Videos') {
      navigation.navigate('Watch');
    } else if (item.type === 'Followers') {
      navigation.navigate('Profile');
    } else if (item.type === 'Statuses') {
      navigation.navigate('Status');
    } else if (item.type === 'Live') {
      navigation.navigate('Watch');
    } else {
      navigation.navigate('AccountSettings');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount} unread notifications
          </Text>
        </View>

        <TouchableOpacity
          onPress={markAllAsRead}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter &&
                styles.activeFilter,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter &&
                  styles.activeFilterText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>
              No notifications
            </Text>
            <Text style={styles.emptyDescription}>
              New activity will appear here.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.notificationCard,
                !item.read && styles.unreadCard,
              ]}
              onPress={() => openNotification(item)}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.notificationIcon}>
                  {item.icon}
                </Text>
              </View>

              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>
                  {item.title}
                </Text>

                <Text style={styles.notificationDescription}>
                  {item.description}
                </Text>

                <Text style={styles.time}>
                  {item.time}
                </Text>
              </View>

              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}

        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearNotifications}
          >
            <Text style={styles.clearButtonText}>
              Clear all notifications
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.demoNote}>
          Demonstration notifications only. Real-time notifications
          require backend events and push notification services.
        </Text>
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
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 10,
    marginTop: 4,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterScroll: {
    maxHeight: 57,
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F2F4F7',
    marginRight: 7,
  },
  activeFilter: {
    backgroundColor: '#075E54',
  },
  filterText: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  content: {
    padding: 14,
    paddingBottom: 35,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  unreadCard: {
    backgroundColor: '#EDF7F5',
    borderColor: '#C9E5DE',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 21,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationDescription: {
    color: '#667085',
    fontSize: 10,
    marginTop: 5,
  },
  time: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 6,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#075E54',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 35,
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
  emptyDescription: {
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 6,
  },
  clearButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
  },
  clearButtonText: {
    color: '#D92D20',
    fontSize: 11,
    fontWeight: 'bold',
  },
  demoNote: {
    color: '#98A2B3',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 15,
  },
});
