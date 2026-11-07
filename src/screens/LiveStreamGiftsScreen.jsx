
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';

const giftList = [
  { id: '1', name: 'Heart', emoji: '❤️', price: 5 },
  { id: '2', name: 'Rose', emoji: '🌹', price: 10 },
  { id: '3', name: 'Coffee', emoji: '☕', price: 15 },
  { id: '4', name: 'Crown', emoji: '👑', price: 50 },
  { id: '5', name: 'Diamond', emoji: '💎', price: 100 },
  { id: '6', name: 'Rocket', emoji: '🚀', price: 250 },
  { id: '7', name: 'Lion', emoji: '🦁', price: 500 },
  { id: '8', name: 'Superstar', emoji: '🌟', price: 1000 },
];

export default function LiveStreamGiftsScreen({ navigation }) {
  const [balance, setBalance] = useState(500);
  const [selectedGift, setSelectedGift] = useState(null);
  const [sentGifts, setSentGifts] = useState([]);

  const sendGift = () => {
    if (!selectedGift) {
      Alert.alert('Select a gift', 'Choose a gift first.');
      return;
    }

    if (balance < selectedGift.price) {
      Alert.alert(
        'Insufficient coins',
        'You do not have enough demo coins for this gift.'
      );
      return;
    }

    setBalance((previous) => previous - selectedGift.price);

    setSentGifts((previous) => [
      {
        ...selectedGift,
        id: Date.now().toString(),
      },
      ...previous,
    ]);

    Alert.alert(
      'Gift sent!',
      `You sent ${selectedGift.emoji} ${selectedGift.name}.`
    );

    setSelectedGift(null);
  };

  const renderGift = ({ item }) => {
    const selected = selectedGift?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.giftCard,
          selected && styles.selectedGift,
        ]}
        onPress={() => setSelectedGift(item)}
      >
        <Text style={styles.giftEmoji}>{item.emoji}</Text>

        <Text style={styles.giftName}>{item.name}</Text>

        <Text style={styles.giftPrice}>
          🪙 {item.price}
        </Text>

        {selected && (
          <Text style={styles.selectedLabel}>Selected</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Live Gifts</Text>

        <View style={{ width: 45 }} />
      </View>

      <View style={styles.creatorCard}>
        <Text style={styles.creatorEmoji}>🎥</Text>

        <View style={styles.creatorInfo}>
          <Text style={styles.creatorTitle}>
            Support this creator
          </Text>

          <Text style={styles.creatorSubtitle}>
            Send a gift during the live stream.
          </Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>
            YOUR DEMO BALANCE
          </Text>

          <Text style={styles.balanceAmount}>
            🪙 {balance.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={() =>
            Alert.alert(
              'Coin purchases',
              'Real coin purchases will only be enabled after secure payment integration and platform policy review.'
            )
          }
        >
          <Text style={styles.buyText}>Get coins</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        Choose a gift
      </Text>

      <FlatList
        data={giftList}
        renderItem={renderGift}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.giftList}
      />

      {selectedGift && (
        <View style={styles.selectedPanel}>
          <Text style={styles.selectedText}>
            {selectedGift.emoji} {selectedGift.name}
            {'  '}•{'  '}
            🪙 {selectedGift.price}
          </Text>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendGift}
          >
            <Text style={styles.sendButtonText}>
              SEND GIFT
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.activity}>
        <Text style={styles.activityTitle}>
          Your recent gifts
        </Text>

        {sentGifts.length === 0 ? (
          <Text style={styles.empty}>
            You have not sent any gifts yet.
          </Text>
        ) : (
          sentGifts.slice(0, 3).map((gift) => (
            <Text key={gift.id} style={styles.activityItem}>
              {gift.emoji} {gift.name} — 🪙 {gift.price}
            </Text>
          ))
        )}
      </View>

      <Text style={styles.disclaimer}>
        Demo coins have no cash value. Real purchases,
        creator earnings and withdrawals are not enabled.
      </Text>
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
    paddingTop: 43,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  creatorCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorEmoji: {
    fontSize: 35,
    marginRight: 13,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  creatorSubtitle: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 5,
  },
  balanceCard: {
    marginHorizontal: 15,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#075E54',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#D1E7E1',
    fontSize: 9,
    fontWeight: 'bold',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },
  buyButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
  },
  buyText: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    margin: 16,
  },
  giftList: {
    paddingHorizontal: 10,
  },
  giftCard: {
    flex: 1,
    margin: 5,
    padding: 13,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  selectedGift: {
    borderColor: '#075E54',
    borderWidth: 2,
    backgroundColor: '#E8F4F1',
  },
  giftEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  giftName: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  giftPrice: {
    color: '#075E54',
    fontSize: 11,
    marginTop: 6,
  },
  selectedLabel: {
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 5,
  },
  selectedPanel: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
  },
  sendButton: {
    backgroundColor: '#075E54',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activity: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  activityTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  empty: {
    color: '#98A2B3',
    fontSize: 10,
  },
  activityItem: {
    color: '#475467',
    fontSize: 10,
    marginVertical: 4,
  },
  disclaimer: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    margin: 13,
    lineHeight: 14,
  },
});
