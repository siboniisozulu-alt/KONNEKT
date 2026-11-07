
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const payoutHistory = [
  {
    id: '1',
    date: 'Example: 05 November 2026',
    amount: 'R250.00',
    status: 'Demo',
  },
  {
    id: '2',
    date: 'Example: 28 October 2026',
    amount: 'R180.00',
    status: 'Demo',
  },
  {
    id: '3',
    date: 'Example: 20 October 2026',
    amount: 'R95.00',
    status: 'Demo',
  },
];

export default function CreatorPayoutScreen({ navigation }) {
  const [paymentMethod, setPaymentMethod] = useState('Not connected');

  const requestWithdrawal = () => {
    Alert.alert(
      'Withdrawals unavailable',
      'KONNEKT payments are not active yet. No real money can currently be withdrawn.'
    );
  };

  const setupBankAccount = () => {
    Alert.alert(
      'Bank account setup',
      'Secure bank account registration will be available after KONNEKT payment integration and verification are completed.'
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

        <Text style={styles.headerTitle}>Creator Payouts</Text>

        <Text style={styles.headerIcon}>🏦</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceAmount}>R0.00</Text>
        <Text style={styles.balanceNote}>
          Confirmed withdrawable balance
        </Text>

        <View style={styles.balanceDivider} />

        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.smallLabel}>Pending earnings</Text>
            <Text style={styles.smallAmount}>R0.00</Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>Lifetime paid</Text>
            <Text style={styles.smallAmount}>R0.00</Text>
          </View>
        </View>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Payment system not active</Text>
        <Text style={styles.noticeText}>
          This screen is a prototype. KONNEKT has not yet connected
          a payment provider or processed creator payouts.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Payment method</Text>

      <View style={styles.paymentCard}>
        <View style={styles.bankIcon}>
          <Text style={styles.bankEmoji}>🏦</Text>
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>South African bank account</Text>
          <Text style={styles.paymentSubtitle}>{paymentMethod}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.setupButton}
        onPress={setupBankAccount}
      >
        <Text style={styles.setupButtonText}>
          + Set up payment method
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Withdrawal</Text>

      <View style={styles.withdrawCard}>
        <Text style={styles.withdrawTitle}>Request a payout</Text>

        <Text style={styles.withdrawDescription}>
          Withdrawals will only become available when your account
          has verified earnings, meets the minimum payout threshold
          and has an approved payment method.
        </Text>

        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={requestWithdrawal}
        >
          <Text style={styles.withdrawButtonText}>
            WITHDRAWAL UNAVAILABLE
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Payout history</Text>

      {payoutHistory.map(item => (
        <View key={item.id} style={styles.historyCard}>
          <View style={styles.historyIcon}>
            <Text style={styles.historyEmoji}>💸</Text>
          </View>

          <View style={styles.historyInfo}>
            <Text style={styles.historyAmount}>{item.amount}</Text>
            <Text style={styles.historyDate}>{item.date}</Text>
          </View>

          <View style={styles.demoBadge}>
            <Text style={styles.demoText}>{item.status}</Text>
          </View>
        </View>
      ))}

      <View style={styles.securityCard}>
        <Text style={styles.securityTitle}>🔐 Payment security</Text>
        <Text style={styles.securityText}>
          Bank information must be collected through a secure,
          approved payment provider. Never share your banking PIN,
          card PIN or online banking password with KONNEKT.
        </Text>
      </View>

      <Text style={styles.footer}>
        All balances are currently R0.00. History entries are
        examples only and do not represent real transactions.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  content: {
    paddingBottom: 35,
  },
  header: {
    backgroundColor: '#075E54',
    paddingTop: 43,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerIcon: {
    fontSize: 20,
  },
  balanceCard: {
    backgroundColor: '#075E54',
    margin: 14,
    padding: 19,
    borderRadius: 13,
  },
  balanceLabel: {
    color: '#D1E7E3',
    fontSize: 11,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 7,
  },
  balanceNote: {
    color: '#D1E7E3',
    fontSize: 9,
    marginTop: 5,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: '#39877D',
    marginVertical: 17,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallLabel: {
    color: '#D1E7E3',
    fontSize: 9,
  },
  smallAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  noticeCard: {
    backgroundColor: '#FEF3F2',
    marginHorizontal: 14,
    padding: 14,
    borderRadius: 9,
    borderLeftWidth: 3,
    borderLeftColor: '#D92D20',
  },
  noticeTitle: {
    color: '#B42318',
    fontSize: 11,
    fontWeight: 'bold',
  },
  noticeText: {
    color: '#7A271A',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 21,
    marginBottom: 11,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    width: 43,
    height: 43,
    borderRadius: 9,
    backgroundColor: '#E8F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankEmoji: {
    fontSize: 23,
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  paymentSubtitle: {
    color: '#667085',
    fontSize: 10,
    marginTop: 5,
  },
  setupButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 9,
    padding: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#075E54',
    alignItems: 'center',
  },
  setupButtonText: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  withdrawCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 16,
    borderRadius: 10,
  },
  withdrawTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  withdrawDescription: {
    color: '#667085',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 7,
  },
  withdrawButton: {
    backgroundColor: '#EAECF0',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  withdrawButtonText: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 8,
    padding: 12,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 38,
    height: 38,
    backgroundColor: '#E8F4F1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmoji: {
    fontSize: 20,
  },
  historyInfo: {
    flex: 1,
    marginLeft: 10,
  },
  historyAmount: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  historyDate: {
    color: '#667085',
    fontSize: 9,
    marginTop: 4,
  },
  demoBadge: {
    backgroundColor: '#F2F4F7',
    padding: 6,
    borderRadius: 5,
  },
  demoText: {
    color: '#667085',
    fontSize: 8,
    fontWeight: 'bold',
  },
  securityCard: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 15,
    borderRadius: 10,
  },
  securityTitle: {
    color: '#075E54',
    fontSize: 11,
    fontWeight: 'bold',
  },
  securityText: {
    color: '#667085',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 7,
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 15,
  },
});
