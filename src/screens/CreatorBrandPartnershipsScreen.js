
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const campaigns = [
  {
    id: '1',
    brand: 'Local Fashion Campaign',
    category: 'Fashion',
    description: 'Create content featuring local fashion products.',
    reward: 'Example: R1,500',
    status: 'Open',
    emoji: '👕',
  },
  {
    id: '2',
    brand: 'Food and Lifestyle Campaign',
    category: 'Food',
    description: 'Showcase a food or lifestyle business.',
    reward: 'Example: R900',
    status: 'Open',
    emoji: '🍔',
  },
  {
    id: '3',
    brand: 'Technology Creator Campaign',
    category: 'Technology',
    description: 'Create a demonstration of a technology product.',
    reward: 'Example: R2,000',
    status: 'Coming soon',
    emoji: '📱',
  },
];

export default function CreatorBrandPartnershipsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('Discover');
  const [applications, setApplications] = useState([]);

  const applyCampaign = (campaign) => {
    if (campaign.status !== 'Open') {
      Alert.alert('Campaign unavailable', 'This campaign is not accepting applications.');
      return;
    }

    if (applications.includes(campaign.id)) {
      Alert.alert('Already applied', 'You have already applied to this sample campaign.');
      return;
    }

    Alert.alert(
      'Campaign application',
      `Apply for ${campaign.brand}? This prototype will only record a local sample application.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            setApplications(current => [...current, campaign.id]);
            Alert.alert('Demo application', 'Your sample application has been added locally. No brand has received it.');
          },
        },
      ]
    );
  };

  const showPartnershipInfo = () => {
    Alert.alert(
      'Creator partnerships',
      'Real brand partnerships will require verified businesses, campaign agreements, transparent sponsorship disclosures and secure payments.'
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

        <Text style={styles.headerTitle}>Brand Partnerships</Text>

        <Text style={styles.headerIcon}>🤝</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🌟</Text>
        <Text style={styles.heroTitle}>Connect with brands</Text>
        <Text style={styles.heroDescription}>
          Discover opportunities to work with businesses,
          create sponsored content and grow your creator career.
        </Text>

        <Text style={styles.heroBadge}>PARTNERSHIPS PREVIEW</Text>
      </View>

      <View style={styles.tabs}>
        {['Discover', 'My applications'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'Discover' && (
        <>
          <Text style={styles.sectionTitle}>
            Available opportunities
          </Text>

          {campaigns.map(campaign => (
            <View key={campaign.id} style={styles.campaignCard}>
              <View style={styles.campaignTop}>
                <View style={styles.campaignIcon}>
                  <Text style={styles.campaignEmoji}>
                    {campaign.emoji}
                  </Text>
                </View>

                <View style={styles.campaignInfo}>
                  <Text style={styles.campaignName}>
                    {campaign.brand}
                  </Text>
                  <Text style={styles.category}>
                    {campaign.category}
                  </Text>
                </View>

                <Text style={[
                  styles.status,
                  campaign.status === 'Open'
                    ? styles.openStatus
                    : styles.closedStatus,
                ]}>
                  {campaign.status}
                </Text>
              </View>

              <Text style={styles.description}>
                {campaign.description}
              </Text>

              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>
                  Example campaign reward
                </Text>
                <Text style={styles.reward}>
                  {campaign.reward}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => applyCampaign(campaign)}
                disabled={campaign.status !== 'Open'}
              >
                <Text style={styles.applyText}>
                  {applications.includes(campaign.id)
                    ? 'APPLICATION RECORDED'
                    : campaign.status === 'Open'
                      ? 'APPLY FOR CAMPAIGN'
                      : 'COMING SOON'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {selectedTab === 'My applications' && (
        <>
          <Text style={styles.sectionTitle}>
            Your campaign applications
          </Text>

          {applications.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>
                No applications yet
              </Text>
              <Text style={styles.emptyDescription}>
                Applications you make in this demo will appear here.
              </Text>
            </View>
          ) : (
            applications.map(id => {
              const campaign = campaigns.find(item => item.id === id);

              if (!campaign) return null;

              return (
                <View key={id} style={styles.applicationCard}>
                  <Text style={styles.applicationTitle}>
                    {campaign.brand}
                  </Text>
                  <Text style={styles.applicationStatus}>
                    Demo application recorded locally
                  </Text>
                </View>
              );
            })
          )}
        </>
      )}

      <View style={styles.guidelinesCard}>
        <Text style={styles.guidelinesTitle}>
          📋 Partnership guidelines
        </Text>

        <Text style={styles.guideline}>
          • Only work with verified businesses.
        </Text>

        <Text style={styles.guideline}>
          • Clearly disclose paid sponsorships.
        </Text>

        <Text style={styles.guideline}>
          • Agree on deliverables before creating content.
        </Text>

        <Text style={styles.guideline}>
          • Never pay an unknown person to receive a campaign.
        </Text>

        <TouchableOpacity
          style={styles.infoButton}
          onPress={showPartnershipInfo}
        >
          <Text style={styles.infoButtonText}>
            LEARN ABOUT PARTNERSHIPS
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        All campaigns, brands and rewards shown are fictional
        examples. No real brand is offering these opportunities.
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
    borderRadius: 13,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 42,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  heroDescription: {
    color: '#D1E7E3',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
  heroBadge: {
    color: '#075E54',
    backgroundColor: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 4,
    borderRadius: 9,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 11,
    borderRadius: 7,
  },
  activeTab: {
    backgroundColor: '#075E54',
  },
  tabText: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeTabText: {
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
  campaignCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 11,
    padding: 14,
    borderRadius: 11,
  },
  campaignTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignIcon: {
    width: 43,
    height: 43,
    backgroundColor: '#E8F4F1',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignEmoji: {
    fontSize: 23,
  },
  campaignInfo: {
    flex: 1,
    marginLeft: 10,
  },
  campaignName: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  category: {
    color: '#667085',
    fontSize: 9,
    marginTop: 4,
  },
  status: {
    fontSize: 8,
    fontWeight: 'bold',
    padding: 6,
    borderRadius: 5,
    overflow: 'hidden',
  },
  openStatus: {
    color: '#067647',
    backgroundColor: '#ECFDF3',
  },
  closedStatus: {
    color: '#667085',
    backgroundColor: '#F2F4F7',
  },
  description: {
    color: '#667085',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 13,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
  },
  rewardLabel: {
    color: '#667085',
    fontSize: 9,
  },
  reward: {
    color: '#075E54',
    fontSize: 11,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#075E54',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 13,
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    padding: 25,
    borderRadius: 11,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 34,
  },
  emptyTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptyDescription: {
    color: '#667085',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 9,
    padding: 14,
    borderRadius: 9,
  },
  applicationTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  applicationStatus: {
    color: '#667085',
    fontSize: 9,
    marginTop: 6,
  },
  guidelinesCard: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 15,
    borderRadius: 10,
  },
  guidelinesTitle: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  guideline: {
    color: '#344054',
    fontSize: 10,
    lineHeight: 19,
  },
  infoButton: {
    backgroundColor: '#E8F4F1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 13,
  },
  infoButtonText: {
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    lineHeight: 15,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
