
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

const initialFollowing = [];

export default function FollowingScreen({ navigation }) {
  const [following, setFollowing] = useState([]);
  const [search, setSearch] = useState('');

  const filteredFollowing = following.filter((person) =>
    `${person.name} ${person.username}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const unfollowPerson = (person) => {
    Alert.alert(
      'Unfollow account?',
      `You will stop following ${person.name}.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: () => {
            setFollowing((previous) =>
              previous.filter((item) => item.id !== person.id)
            );
          },
        },
      ]
    );
  };

  const openProfile = (person) => {
    Alert.alert(
      person.name,
      `${person.username}\n\nConnect this action to the KONNEKT public profile screen.`,
      [{ text: 'OK' }]
    );
  };

  const renderPerson = ({ item }) => (
    <View style={styles.personCard}>
      <TouchableOpacity
        style={styles.personInfo}
        onPress={() => openProfile(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>

        <View style={styles.nameContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {item.verified && (
              <Text style={styles.verified}> ✓</Text>
            )}
          </View>

          <Text style={styles.username}>{item.username}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.followingButton}
        onPress={() => unfollowPerson(item)}
      >
        <Text style={styles.followingText}>Following</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Following</Text>

        <Text style={styles.headerIcon}>➕</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryNumber}>{following.length}</Text>
        <Text style={styles.summaryLabel}>Accounts you follow</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search following..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your connections</Text>
        <Text style={styles.count}>
          {filteredFollowing.length} accounts
        </Text>
      </View>

      {filteredFollowing.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>
            No accounts found
          </Text>
          <Text style={styles.emptyText}>
            Search for another account or discover creators on Watch.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFollowing}
          keyExtractor={(item) => item.id}
          renderItem={renderPerson}
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  headerIcon: {
    color: '#FFFFFF',
    fontSize: 21,
  },
  summaryCard: {
    backgroundColor: '#E8F4F1',
    margin: 15,
    padding: 18,
    borderRadius: 13,
    alignItems: 'center',
  },
  summaryNumber: {
    color: '#075E54',
    fontSize: 28,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: '#526B67',
    fontSize: 11,
    marginTop: 4,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  searchIcon: {
    color: '#667085',
    fontSize: 22,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 43,
    color: '#17202A',
    fontSize: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  count: {
    color: '#98A2B3',
    fontSize: 10,
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },
  personCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  personInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E8F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
  },
  nameContainer: {
    marginLeft: 10,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  verified: {
    color: '#1877F2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  username: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 4,
  },
  followingButton: {
    backgroundColor: '#E8ECEF',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 7,
    marginLeft: 5,
  },
  followingText: {
    color: '#475467',
    fontSize: 9,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
    marginTop: 7,
  },
});
