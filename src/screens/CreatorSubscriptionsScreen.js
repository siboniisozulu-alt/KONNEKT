
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const plans = [
  {
    id: '1',
    name: 'Supporter',
    price: 'R29.99',
    description: 'Support your favourite creator.',
    benefits: [
      'Supporter badge',
      'Exclusive posts',
      'Subscriber community',
    ],
  },
  {
    id: '2',
    name: 'VIP Supporter',
    price: 'R59.99',
    description: 'Enjoy additional creator benefits.',
    benefits: [
      'Everything in Supporter',
      'Exclusive videos',
      'Special live-stream access',
      'Priority community recognition',
    ],
  },
  {
    id: '3',
    name: 'Super Fan',
    price: 'R99.99',
    description: 'Get closer to your favourite creator.',
    benefits: [
      'Everything in VIP Supporter',
      'Premium content',
      'Special fan events',
      'Exclusive supporter recognition',
    ],
  },
];

export default function CreatorSubscriptionsScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('1');
  const [isCreatorView, setIsCreatorView] = useState(false);

  const subscribe = (plan) => {
    Alert.alert(
      'Subscriptions coming soon',
      `${plan.name} costs ${plan.price} per month. Payments are not active yet, so no subscription or charge has been created.`
    );
  };

  const manageSubscribers = () => {
    Alert.alert(
      'Subscriber management',
      'A real subscriber list will appear here after subscription services are connected.'
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

        <Text style={styles.headerTitle}>Creator Subscriptions</Text>

        <Text style={styles.headerIcon}>⭐</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🌟</Text>
        <Text style={styles.heroTitle}>Support creators you love</Text>
        <Text style={styles.heroDescription}>
          Discover exclusive creator communities and special
          content through monthly subscriptions.
        </Text>

        <Text style={styles.comingSoon}>SUBSCRIPTIONS COMING SOON</Text>
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            !isCreatorView && styles.modeActive,
          ]}
          onPress={() => setIsCreatorView(false)}
        >
          <Text style={[
            styles.modeText,
            !isCreatorView && styles.modeActiveText,
          ]}>
            Support a creator
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            isCreatorView && styles.modeActive,
          ]}
          onPress={() => setIsCreatorView(true)}
        >
          <Text style={[
            styles.modeText,
            isCreatorView && styles.modeActiveText,
          ]}>
            Creator tools
          </Text>
        </TouchableOpacity>
      </View>

      {!isCreatorView && (
        <>
          <Text style={styles.sectionTitle}>Choose a subscription</Text>

          {plans.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlan,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>
                    {plan.description}
                  </Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.monthText}>/month</Text>
                </View>
              </View>

              <View style={styles.benefits}>
                {plan.benefits.map((benefit, index) => (
                  <Text key={index} style={styles.benefit}>
                    ✓ {benefit}
                  </Text>
                ))}
              </View>

              {selectedPlan === plan.id && (
                <Text style={styles.selectedLabel}>
                  SELECTED PLAN
                </Text>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => {
              const plan = plans.find(p => p.id === selectedPlan);
              if (plan) subscribe(plan);
            }}
          >
            <Text style={styles.subscribeText}>
              CONTINUE WITH SELECTED PLAN
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            These are example prices for a proposed feature.
            Selecting a plan does not create a subscription or
            charge your account.
          </Text>
        </>
      )}

      {isCreatorView && (
        <>
          <Text style={styles.sectionTitle}>Your subscriber centre</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Active subscribers</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>R0.00</Text>
              <Text style={styles.statLabel}>Monthly revenue</Text>
            </View>
          </View>

          <View style={styles.creatorCard}>
            <Text style={styles.creatorCardTitle}>
              Manage your subscribers
            </Text>
            <Text style={styles.creatorCardDescription}>
              View subscriber information, manage membership
              benefits and monitor subscription activity.
            </Text>

            <TouchableOpacity
              style={styles.manageButton}
              onPress={manageSubscribers}
            >
              <Text style={styles.manageButtonText}>
                MANAGE SUBSCRIBERS
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.creatorCard}>
            <Text style={styles.creatorCardTitle}>
              Create exclusive content
            </Text>
            <Text style={styles.creatorCardDescription}>
              Prepare special videos, posts and live-stream
              experiences for future subscribers.
            </Text>

            <TouchableOpacity
              style={styles.manageButton}
              onPress={() =>
                Alert.alert(
                  'Exclusive content',
                  'Subscriber-only publishing will be added when subscription access controls are implemented.'
                )
              }
            >
              <Text style={styles.manageButtonText}>
                CREATE EXCLUSIVE CONTENT
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.securityCard}>
        <Text style={styles.securityTitle}>🔐 Subscription protection</Text>
        <Text style={styles.securityText}>
          Real subscriptions will require secure recurring payments,
          clear cancellation rules, refund handling and protected
          access to subscriber-only content.
        </Text>
      </View>
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
    borderRadius: 13,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 42,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  heroDescription: {
    color: '#D1E7E3',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
  comingSoon: {
    color: '#075E54',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 15,
  },
  modeRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 9,
  },
  modeButton: {
    flex: 1,
    padding: 11,
    borderRadius: 7,
    alignItems: 'center',
  },
  modeActive: {
    backgroundColor: '#075E54',
  },
  modeText: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modeActiveText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 21,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 11,
    padding: 15,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  selectedPlan: {
    borderColor: '#075E54',
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
    paddingRight: 8,
  },
  planName: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  planDescription: {
    color: '#667085',
    fontSize: 9,
    marginTop: 5,
    lineHeight: 14,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    color: '#075E54',
    fontSize: 19,
    fontWeight: 'bold',
  },
  monthText: {
    color: '#98A2B3',
    fontSize: 9,
  },
  benefits: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
    paddingTop: 10,
  },
  benefit: {
    color: '#344054',
    fontSize: 10,
    marginVertical: 4,
  },
  selectedLabel: {
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 12,
  },
  subscribeButton: {
    backgroundColor: '#075E54',
    marginHorizontal: 14,
    marginTop: 7,
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
  },
  subscribeText: {
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
    marginTop: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 9,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 5,
    padding: 16,
    borderRadius: 10,
  },
  statNumber: {
    color: '#075E54',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#667085',
    fontSize: 9,
    marginTop: 5,
  },
  creatorCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 11,
    padding: 16,
    borderRadius: 10,
  },
  creatorCardTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  creatorCardDescription: {
    color: '#667085',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 7,
  },
  manageButton: {
    backgroundColor: '#075E54',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 13,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
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
});
