
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';

const sampleStatuses = [
  {
    id: '1',
    name: 'Thabo',
    time: '10 minutes ago',
    avatar: '👨🏽',
    viewed: false
  },
  {
    id: '2',
    name: 'Lerato',
    time: '30 minutes ago',
    avatar: '👩🏽',
    viewed: false
  },
  {
    id: '3',
    name: 'Sipho',
    time: '2 hours ago',
    avatar: '👨🏿',
    viewed: true
  },
  {
    id: '4',
    name: 'Nomsa',
    time: '5 hours ago',
    avatar: '👩🏿',
    viewed: true
  }
];

export default function StatusScreen({ navigation }) {
  const [statuses, setStatuses] = useState(sampleStatuses);

  const openStatus = item => {
    setStatuses(previous =>
      previous.map(status =>
        status.id === item.id
          ? { ...status, viewed: true }
          : status
      )
    );

    Alert.alert(
      item.name + "'s Status",
      'Status viewing and photo/video playback will be connected later.'
    );
  };

  const renderStatus = ({ item }) => (
    <TouchableOpacity
      style={styles.statusItem}
      onPress={() => openStatus(item)}
    >
      <View
        style={[
          styles.avatarBorder,
          item.viewed ? styles.viewedBorder : styles.unviewedBorder
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
      </View>

      <View style={styles.statusDetails}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Status</Text>
      </View>

      <TouchableOpacity
        style={styles.myStatus}
        onPress={() =>
          Alert.alert(
            'My Status',
            'Photo, video and text status creation will be connected later.'
          )
        }
      >
        <View style={styles.myAvatar}>
          <Text style={styles.avatarText}>👤</Text>
          <View style={styles.addBadge}>
            <Text style={styles.addText}>＋</Text>
          </View>
        </View>

        <View style={styles.statusDetails}>
          <Text style={styles.name}>My Status</Text>
          <Text style={styles.time}>Tap to add a status update</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent updates</Text>

      <FlatList
        data={statuses.filter(item => !item.viewed)}
        keyExtractor={item => item.id}
        renderItem={renderStatus}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No new status updates.
          </Text>
        }
      />

      <Text style={styles.sectionTitle}>Viewed updates</Text>

      <FlatList
        data={statuses.filter(item => item.viewed)}
        keyExtractor={item => item.id}
        renderItem={renderStatus}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No viewed updates yet.
          </Text>
        }
      />

      <Text style={styles.notice}>
        Status updates will expire automatically after 24 hours.
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
    marginTop: 25,
    marginBottom: 25
  },
  back: {
    color: '#00E5A8',
    fontSize: 16,
    marginBottom: 12
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold'
  },
  myStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25
  },
  myAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#14243A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  avatarBorder: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  unviewedBorder: {
    borderColor: '#00E5A8'
  },
  viewedBorder: {
    borderColor: '#66758A'
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#14243A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 27
  },
  addBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#00E5A8',
    width: 21,
    height: 21,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addText: {
    color: '#07111F',
    fontWeight: 'bold'
  },
  statusDetails: {
    flex: 1
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  time: {
    color: '#8A99AD',
    fontSize: 12,
    marginTop: 5
  },
  sectionTitle: {
    color: '#00E5A8',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  emptyText: {
    color: '#8A99AD',
    fontSize: 13,
    paddingVertical: 15
  },
  notice: {
    color: '#8A99AD',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 15
  }
});
