
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';

const categories = [
  'Music',
  'Comedy',
  'Education',
  'Sports',
  'Gaming',
  'News',
  'Technology',
  'Fashion',
  'Food and Cooking',
  'Travel',
  'Fitness',
  'Business',
  'Lifestyle',
  'Entertainment',
];

export default function ContentPreferencesScreen({ navigation }) {
  const [selectedCategories, setSelectedCategories] = useState([
    'Music',
    'Comedy',
    'Entertainment',
  ]);

  const [settings, setSettings] = useState({
    personalizedFeed: true,
    showFollowingContent: true,
    showTrendingContent: true,
    sensitiveContent: false,
    autoplayVideos: true,
  });

  const toggleCategory = (category) => {
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
  };

  const toggleSetting = (key) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const savePreferences = () => {
    Alert.alert(
      'Preferences saved (demo)',
      'Your selections are currently stored only in this screen. Connect a backend to save and apply them to your KONNEKT feed.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const SettingRow = ({ title, description, settingKey }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>

      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: '#D0D5DD', true: '#91C9B8' }}
        thumbColor={settings[settingKey] ? '#075E54' : '#F4F4F4'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content preferences</Text>
        <Text style={styles.headerIcon}>⚙️</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🎬</Text>
          <Text style={styles.introTitle}>
            Make KONNEKT yours
          </Text>
          <Text style={styles.introDescription}>
            Choose what you enjoy watching. Your choices can help
            shape your Watch feed once recommendations are connected.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          YOUR INTERESTS
        </Text>

        <Text style={styles.helper}>
          Select the topics you want to discover.
        </Text>

        <View style={styles.categories}>
          {categories.map((category) => {
            const selected = selectedCategories.includes(category);

            return (
              <TouchableOpacity
                key={category}
                onPress={() => toggleCategory(category)}
                style={[
                  styles.category,
                  selected && styles.categorySelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.categoryTextSelected,
                  ]}
                >
                  {selected ? '✓ ' : '+ '}
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>
          FEED SETTINGS
        </Text>

        <View style={styles.settingsCard}>
          <SettingRow
            title="Personalized recommendations"
            description="Use your activity and interests to suggest content."
            settingKey="personalizedFeed"
          />

          <SettingRow
            title="Following feed"
            description="Include videos from creators you follow."
            settingKey="showFollowingContent"
          />

          <SettingRow
            title="Trending content"
            description="Show popular videos and current trends."
            settingKey="showTrendingContent"
          />

          <SettingRow
            title="Sensitive content"
            description="Allow more content that may be unsuitable for some viewers."
            settingKey="sensitiveContent"
          />

          <SettingRow
            title="Autoplay videos"
            description="Automatically play the next video."
            settingKey="autoplayVideos"
          />
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Your control matters</Text>
          <Text style={styles.noticeText}>
            These preferences should work alongside KONNEKT's
            community rules, safety filters and age-appropriate
            content protections.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePreferences}
        >
          <Text style={styles.saveButtonText}>
            Save preferences
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 21,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  introCard: {
    backgroundColor: '#E8F4F1',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 23,
  },
  introIcon: {
    fontSize: 38,
    marginBottom: 8,
  },
  introTitle: {
    color: '#075E54',
    fontSize: 17,
    fontWeight: 'bold',
  },
  introDescription: {
    color: '#526B67',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    color: '#475467',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 9,
    marginTop: 8,
  },
  helper: {
    color: '#98A2B3',
    fontSize: 11,
    marginBottom: 12,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 22,
  },
  category: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 22,
    marginRight: 7,
    marginBottom: 9,
  },
  categorySelected: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  categoryText: {
    color: '#475467',
    fontSize: 10,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  settingText: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  settingDescription: {
    color: '#98A2B3',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 4,
  },
  notice: {
    backgroundColor: '#FFF4E5',
    padding: 14,
    borderRadius: 11,
    marginTop: 20,
  },
  noticeTitle: {
    color: '#9A5B00',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noticeText: {
    color: '#805000',
    fontSize: 10,
    lineHeight: 17,
  },
  saveButton: {
    backgroundColor: '#075E54',
    padding: 16,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 22,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
