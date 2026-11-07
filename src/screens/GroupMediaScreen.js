
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';

const demoMedia = [
  {
    id: '1',
    title: 'Birthday celebration',
    type: 'Photos',
    icon: '🖼️',
    date: 'Today',
    sender: 'Thabo',
  },
  {
    id: '2',
    title: 'Weekend video',
    type: 'Videos',
    icon: '🎬',
    date: 'Yesterday',
    sender: 'Lerato',
  },
  {
    id: '3',
    title: 'Group plans.pdf',
    type: 'Documents',
    icon: '📄',
    date: 'Monday',
    sender: 'Sipho',
  },
  {
    id: '4',
    title: 'KONNEKT website',
    type: 'Links',
    icon: '🔗',
    date: 'Tuesday',
    sender: 'Nomsa',
  },
];

const categories = [
  'All',
  'Photos',
  'Videos',
  'Documents',
  'Links',
];

export default function GroupMediaScreen({ navigation, route }) {
  const group = route?.params?.group || {
    name: 'KONNEKT Friends',
  };

  const [selectedCategory, setSelectedCategory] = useState('All');

  const [media, setMedia] = useState(
    route?.params?.media || demoMedia
  );

  const filteredMedia =
    selectedCategory === 'All'
      ? media
      : media.filter((item) => item.type === selectedCategory);

  const openMedia = (item) => {
    if (route?.params?.onOpenMedia) {
      route.params.onOpenMedia(item);
      return;
    }

    // Preview placeholder until media storage is connected.
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.mediaCard}
      onPress={() => openMedia(item)}
    >
      <View style={styles.mediaIcon}>
        <Text style={styles.mediaEmoji}>{item.icon}</Text>
      </View>

      <View style={styles.mediaInfo}>
        <Text style={styles.mediaTitle}>{item.title}</Text>
        <Text style={styles.mediaDetails}>
          Shared by {item.sender} · {item.date}
        </Text>
        <Text style={styles.mediaType}>{item.type}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Shared media</Text>
          <Text style={styles.headerSubtitle}>
            {group.name}
          </Text>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => {
            const active = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  active && styles.activeCategory,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.activeCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>
          Group shared content
        </Text>
        <Text style={styles.summaryCount}>
          {filteredMedia.length} items
        </Text>
      </View>

      <FlatList
        data={filteredMedia}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>
              Nothing shared yet
            </Text>
            <Text style={styles.emptyText}>
              Photos, videos, documents and links shared in this
              group will appear here.
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Shared files will be available here once media storage
          and group messaging are connected.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 15,
    paddingVertical: 17,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 12,
    marginTop: 3,
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F0F2F4',
    marginHorizontal: 4,
  },
  activeCategory: {
    backgroundColor: '#075E54',
  },
  categoryText: {
    color: '#475467',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    paddingVertical: 17,
  },
  summaryTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryCount: {
    color: '#667085',
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  mediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  mediaIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EAF5F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaEmoji: {
    fontSize: 23,
  },
  mediaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mediaTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediaDetails: {
    color: '#667085',
    fontSize: 11,
    marginTop: 5,
  },
  mediaType: {
    color: '#075E54',
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
  },
  arrow: {
    color: '#667085',
    fontSize: 24,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 55,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#17202A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  footerText: {
    color: '#667085',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },
});
