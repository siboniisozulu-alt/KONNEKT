
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const periods = ['7 days', '30 days', '90 days'];

const analyticsData = {
  '7 days': {
    views: '12,450',
    likes: '1,240',
    comments: '325',
    shares: '180',
    followers: '+145',
    engagement: '8.6%',
  },
  '30 days': {
    views: '48,900',
    likes: '5,420',
    comments: '1,180',
    shares: '760',
    followers: '+620',
    engagement: '9.2%',
  },
  '90 days': {
    views: '126,700',
    likes: '13,850',
    comments: '3,420',
    shares: '2,140',
    followers: '+1,850',
    engagement: '10.1%',
  },
};

const topVideos = [
  {
    id: '1',
    title: 'My first KONNEKT video',
    views: '25,400',
    likes: '2,300',
    emoji: '🎬',
  },
  {
    id: '2',
    title: 'Weekend vibes',
    views: '18,200',
    likes: '1,750',
    emoji: '🌍',
  },
  {
    id: '3',
    title: 'Behind the scenes',
    views: '9,800',
    likes: '920',
    emoji: '📸',
  },
];

export default function CreatorAnalyticsScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('7 days');

  const data = analyticsData[selectedPeriod];

  const metricCards = [
    { title: 'Video views', value: data.views, icon: '👁' },
    { title: 'Likes', value: data.likes, icon: '❤️' },
    { title: 'Comments', value: data.comments, icon: '💬' },
    { title: 'Shares', value: data.shares, icon: '↗️' },
    { title: 'New followers', value: data.followers, icon: '👥' },
    { title: 'Engagement', value: data.engagement, icon: '📊' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Creator Analytics</Text>

        <Text style={styles.headerIcon}>📈</Text>
      </View>

      <View style={styles.intro}>
        <Text style={styles.introTitle}>Understand your growth</Text>
        <Text style={styles.introDescription}>
          Track how your KONNEKT content performs and discover
          what your audience enjoys.
        </Text>
      </View>

      <View style={styles.periodRow}>
        {periods.map(period => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period)}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activePeriod,
            ]}
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

      <Text style={styles.sectionTitle}>Performance overview</Text>

      <View style={styles.metricsGrid}>
        {metricCards.map(metric => (
          <View key={metric.title} style={styles.metricCard}>
            <Text style={styles.metricIcon}>{metric.icon}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricTitle}>{metric.title}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Audience growth</Text>

      <View style={styles.growthCard}>
        <View>
          <Text style={styles.growthLabel}>New followers</Text>
          <Text style={styles.growthValue}>{data.followers}</Text>
          <Text style={styles.growthCaption}>
            During the selected period
          </Text>
        </View>

        <Text style={styles.growthIcon}>📈</Text>
      </View>

      <Text style={styles.sectionTitle}>Top-performing videos</Text>

      {topVideos.map(video => (
        <View key={video.id} style={styles.videoCard}>
          <View style={styles.videoThumbnail}>
            <Text style={styles.videoEmoji}>{video.emoji}</Text>
          </View>

          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            <Text style={styles.videoStats}>
              👁 {video.views} views
            </Text>
            <Text style={styles.videoStats}>
              ❤️ {video.likes} likes
            </Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Live-stream analytics</Text>

      <View style={styles.liveCard}>
        <Text style={styles.liveIcon}>🔴</Text>

        <View style={styles.liveInfo}>
          <Text style={styles.liveTitle}>Live performance</Text>
          <Text style={styles.liveDescription}>
            Live viewers, watch time, comments and gifts will
            appear here after live-stream analytics are connected.
          </Text>
        </View>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Creator tip</Text>
        <Text style={styles.tipText}>
          Study which videos receive the most engagement.
          Experiment with different topics and posting times
          to learn what your audience enjoys.
        </Text>
      </View>

      <Text style={styles.footer}>
        All displayed analytics are sample figures. Real statistics
        require KONNEKT's backend and event tracking.
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
    paddingBottom: 30,
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
    fontSize: 19,
  },
  intro: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 16,
    borderRadius: 12,
  },
  introTitle: {
    color: '#17202A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  introDescription: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },
  periodRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    padding: 5,
    borderRadius: 9,
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
    fontWeight: 'bold',
  },
  activePeriodText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 22,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 9,
  },
  metricCard: {
    width: '46%',
    margin: '2%',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
  },
  metricIcon: {
    fontSize: 21,
  },
  metricValue: {
    color: '#075E54',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 9,
  },
  metricTitle: {
    color: '#667085',
    fontSize: 10,
    marginTop: 4,
  },
  growthCard: {
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  growthLabel: {
    color: '#667085',
    fontSize: 10,
  },
  growthValue: {
    color: '#075E54',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  growthCaption: {
    color: '#98A2B3',
    fontSize: 9,
    marginTop: 4,
  },
  growthIcon: {
    fontSize: 38,
  },
  videoCard: {
    marginHorizontal: 14,
    marginBottom: 9,
    padding: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoThumbnail: {
    width: 58,
    height: 58,
    backgroundColor: '#E8F4F1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoEmoji: {
    fontSize: 27,
  },
  videoInfo: {
    marginLeft: 12,
    flex: 1,
  },
  videoTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  videoStats: {
    color: '#667085',
    fontSize: 9,
    marginTop: 5,
  },
  liveCard: {
    marginHorizontal: 14,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  liveInfo: {
    flex: 1,
  },
  liveTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveDescription: {
    color: '#667085',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 5,
  },
  tipCard: {
    backgroundColor: '#E8F4F1',
    margin: 14,
    padding: 15,
    borderRadius: 10,
  },
  tipTitle: {
    color: '#075E54',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipText: {
    color: '#344054',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 7,
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    lineHeight: 15,
  },
});
