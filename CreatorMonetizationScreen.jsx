
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const incomeSources = [
  {
    id: '1',
    icon: '🎁',
    title: 'Live gifts',
    description: 'Receive gifts from viewers during live streams.',
    status: 'Coming soon',
  },
  {
    id: '2',
    icon: '📢',
    title: 'Advertising revenue',
    description: 'Earn a share of eligible advertising revenue.',
    status: 'Coming soon',
  },
  {
    id: '3',
    icon: '⭐',
    title: 'Paid subscriptions',
    description: 'Offer exclusive benefits to subscribers.',
    status: 'Coming soon',
  },
  {
    id: '4',
    icon: '🤝',
    title: 'Brand partnerships',
    description: 'Collaborate with businesses and brands.',
    status: 'Coming soon',
  },
];

const requirements = [
  'Complete your creator profile',
  'Verify your phone number',
  'Accept creator monetization terms',
  'Meet platform eligibility requirements',
  'Set up verified payout details',
];

export default function CreatorMonetizationScreen({ navigation }) {
  const [completed, setCompleted] = useState([false, false, false, false, false]);

  const completedCount = completed.filter(Boolean).length;

  const toggleRequirement = (index) => {
    setCompleted(current =>
      current.map((item, i) => i === index ? !item : item)
    );
  };

  const showDetails = (title) => {
    Alert.alert(
      title,
      'This monetization feature is planned for a future KONNEKT release. It is not currently activated.'
    );
  };

  const requestMonetization = () => {
    Alert.alert(
      'Monetization application',
      'Creator monetization applications will be available once KONNEKT launches its verified payment and advertising systems.'
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

        <Text style={styles.headerTitle}>Creator Monetization</Text>

        <Text style={styles.headerIcon}>💰</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>💸</Text>
        <Text style={styles.heroTitle}>Grow with KONNEKT</Text>
        <Text style={styles.heroDescription}>
          Discover ways creators may earn through content,
          live streaming and partnerships.
        </Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>MONETIZATION NOT ACTIVE</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your earnings summary</Text>

      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Confirmed earnings</Text>
        <Text style={styles.earningsAmount}>R0.00</Text>
        <Text style={styles.earningsNote}>
          No real creator payments have been processed.
        </Text>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('CreatorEarnings')}
        >
          <Text style={styles.historyText}>View earnings dashboard</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Ways to earn</Text>

      {incomeSources.map(source => (
        <TouchableOpacity
          key={source.id}
          style={styles.sourceCard}
          onPress={() => showDetails(source.title)}
        >
          <View style={styles.sourceIcon}>
            <Text style={styles.sourceEmoji}>{source.icon}</Text>
          </View>

          <View style={styles.sourceInfo}>
            <Text style={styles.sourceTitle}>{source.title}</Text>
            <Text style={styles.sourceDescription}>
              {source.description}
            </Text>
          </View>

          <View style={styles.comingBadge}>
            <Text style={styles.comingText}>{source.status}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Creator eligibility checklist</Text>

      <View style={styles.checklistCard}>
        <Text style={styles.checklistHeading}>
          Your preparation progress
        </Text>

        <Text style={styles.progressText}>
          {completedCount} of {requirements.length} completed
        </Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(completedCount / requirements.length) * 100}%`,
              },
            ]}
          />
        </View>

        {requirements.map((requirement, index) => (
          <TouchableOpacity
            key={index}
            style={styles.checkRow}
            onPress={() => toggleRequirement(index)}
          >
            <View style={[
              styles.checkbox,
              completed[index] && styles.checkboxActive,
            ]}>
              {completed[index] && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>

            <Text style={[
              styles.requirementText,
              completed[index] && styles.requirementCompleted,
            ]}>
              {requirement}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.checklistNote}>
          This is a personal preparation checklist. Checking an
          item does not verify eligibility or activate payments.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Payout information</Text>

      <View style={styles.payoutCard}>
        <Text style={styles.payoutIcon}>🏦</Text>
        <Text style={styles.payoutTitle}>Secure creator payouts</Text>
        <Text style={styles.payoutDescription}>
          Payment methods, identity checks, payout minimums and
          withdrawal processing will be introduced after payment
          partnerships and compliance requirements are completed.
        </Text>

        <TouchableOpacity
          style={styles.payoutButton}
          onPress={() => showDetails('Payout settings')}
        >
          <Text style={styles.payoutButtonText}>
            Payout settings — coming soon
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={requestMonetization}
      >
        <Text style={styles.applyButtonText}>
          CHECK MONETIZATION AVAILABILITY
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Important: All monetization features on this screen are
        planned features. Earnings are not guaranteed. Real payouts
        require funded revenue, verified eligibility, fraud checks,
        payment partners and applicable legal compliance.
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
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerIcon: {
    fontSize: 20,
  },
  hero: {
    backgroundColor: '#075E54',
    margin: 14,
    padding: 22,
    borderRadius: 14,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 42,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 10,
  },
  heroDescription: {
    color: '#D1E7E3',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 8,
  },
  statusBadge: {
    backgroundColor: '#FEE4E2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 15,
  },
  statusText: {
    color: '#B42318',
    fontSize: 9,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 18,
    marginBottom: 11,
  },
  earningsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 17,
    borderRadius: 11,
  },
  earningsLabel: {
    color: '#667085',
    fontSize: 10,
  },
  earningsAmount: {
    color: '#075E54',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 5,
  },
  earningsNote: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 5,
  },
  historyButton: {
    borderWidth: 1,
    borderColor: '#075E54',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  historyText: {
    color: '#075E54',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sourceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 9,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    width: 43,
    height: 43,
    backgroundColor: '#E8F4F1',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceEmoji: {
    fontSize: 23,
  },
  sourceInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 5,
  },
  sourceTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sourceDescription: {
    color: '#667085',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  comingBadge: {
    backgroundColor: '#F2F4F7',
    padding: 6,
    borderRadius: 5,
  },
  comingText: {
    color: '#667085',
    fontSize: 8,
    fontWeight: 'bold',
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 15,
    borderRadius: 11,
  },
  checklistHeading: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressText: {
    color: '#075E54',
    fontSize: 10,
    marginTop: 9,
  },
  progressBackground: {
    height: 7,
    backgroundColor: '#EAECF0',
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    backgroundColor: '#075E54',
    borderRadius: 5,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#98A2B3',
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  requirementText: {
    color: '#344054',
    fontSize: 10,
    flex: 1,
  },
  requirementCompleted: {
    color: '#98A2B3',
    textDecorationLine: 'line-through',
  },
  checklistNote: {
    color: '#98A2B3',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 9,
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 16,
    borderRadius: 11,
    alignItems: 'center',
  },
  payoutIcon: {
    fontSize: 35,
  },
  payoutTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 9,
  },
  payoutDescription: {
    color: '#667085',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 7,
  },
  payoutButton: {
    backgroundColor: '#F2F4F7',
    padding: 11,
    borderRadius: 8,
    marginTop: 14,
    width: '100%',
    alignItems: 'center',
  },
  payoutButtonText: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#075E54',
    marginHorizontal: 14,
    marginTop: 18,
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: '#98A2B3',
    fontSize: 9,
    lineHeight: 15,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 17,
  },
});
