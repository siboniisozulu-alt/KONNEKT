
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const transactions = [];

export default function CreatorEarningsScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('7 days');

  // No live earnings provider is connected; show zero until verified records are available.
  const demoBalance = 0;
  const demoTotal = 0;
  const demoGifts = 0;
  const demoViews = 0;

  const requestWithdrawal = () => {
    Alert.alert(
      'Withdrawals unavailable',
      'Creator withdrawals will be enabled after KONNEKT connects verified payment accounts, creator eligibility checks and its payment system.'
    );
  };

  const showTransaction = (transaction) => {
    Alert.alert(
      transaction.title,
      `${transaction.description}\nR${transaction.amount.toFixed(2)}\n${transaction.date}\n\nTransaction details are supplied by the connected payments service.`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Creator Earnings</Text>

        <View style={{ width: 45 }} />
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>
          CREATOR EARNINGS
        </Text>
        <Text style={styles.noticeText}>
          Earnings and payment features are not active yet. No money is being collected or paid out.
        </Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>
          AVAILABLE BALANCE
        </Text>

        <Text style={styles.balanceAmount}>
          R{demoBalance.toFixed(2)}
        </Text>

        <Text style={styles.balanceDescription}>
          No verified earnings yet
        </Text>

        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={requestWithdrawal}
        >
          <Text style={styles.withdrawText}>
            Request withdrawal
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.periodRow}>
        {['7 days', '30 days', 'All time'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activePeriod,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period && styles.activePeriodText,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        Earnings overview
      </Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>
            R{demoTotal.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>
            Recorded earnings
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎁</Text>
          <Text style={styles.statValue}>
            {demoGifts}
          </Text>
          <Text style={styles.statLabel}>
            Gifts received
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👁</Text>
          <Text style={styles.statValue}>
            {demoViews.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>
            Video views
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📡</Text>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>
            Live streams
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Recent transactions
      </Text>

      <View style={styles.transactionCard}>
        {transactions.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.transaction,
              index === transactions.length - 1 && styles.lastTransaction,
            ]}
            onPress={() => showTransaction(item)}
          >
            <View style={styles.transactionIcon}>
              <Text style={styles.transactionEmoji}>
                {item.title.includes('gift') ? '🎁' : '🎬'}
              </Text>
            </View>

            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>
                {item.title}
              </Text>

              <Text style={styles.transactionDescription}>
                {item.description} • {item.date}
              </Text>
            </View>

            <Text style={styles.transactionAmount}>
              +R{item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          How creator earnings will work
        </Text>

        <Text style={styles.infoText}>
          1. Eligible creators receive rewards from funded activities.
        </Text>

        <Text style={styles.infoText}>
          2. KONNEKT verifies gifts, views and qualifying transactions.
        </Text>

        <Text style={styles.infoText}>
          3. Confirmed earnings are recorded in a secure ledger.
        </Text>

        <Text style={styles.infoText}>
          4. Eligible creators can request payment after verification.
        </Text>
      </View>

      <Text style={styles.footer}>
        Actual earnings depend on funded revenue, eligibility,
        applicable fees and platform rules. No income is guaranteed.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  content: {
    paddingBottom: 30,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  notice: {
    margin: 14,
    padding: 13,
    backgroundColor: '#FFF4E5',
    borderRadius: 10,
  },
  noticeTitle: {
    color: '#B54708',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noticeText: {
    color: '#7A2E0E',
    fontSize: 10,
    marginTop: 5,
    lineHeight: 15,
  },
  balanceCard: {
    backgroundColor: '#075E54',
    marginHorizontal: 14,
    padding: 20,
    borderRadius: 15,
  },
  balanceLabel: {
    color: '#D1E7E1',
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 10,
  },
  balanceDescription: {
    color: '#D1E7E1',
    fontSize: 10,
    marginTop: 5,
  },
  withdrawButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 20,
  },
  withdrawText: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
  },
  periodRow: {
    flexDirection: 'row',
    margin: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 5,
  },
  periodButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 7,
  },
  activePeriod: {
    backgroundColor: '#075E54',
  },
  periodText: {
    color: '#667085',
    fontSize: 10,
  },
  activePeriodText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 9,
  },
  statCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
  },
  statIcon: {
    fontSize: 22,
  },
  statValue: {
    color: '#075E54',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 9,
  },
  statLabel: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 5,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    borderRadius: 12,
    paddingHorizontal: 13,
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  lastTransaction: {
    borderBottomWidth: 0,
  },
  transactionIcon: {
    width: 37,
    height: 37,
    borderRadius: 20,
    backgroundColor: '#E8F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionEmoji: {
    fontSize: 17,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 10,
  },
  transactionTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  transactionDescription: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 5,
  },
  transactionAmount: {
    color: '#12B76A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 15,
    borderRadius: 12,
  },
  infoTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#667085',
    fontSize: 10,
    lineHeight: 19,
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 15,
  },
});
