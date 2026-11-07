
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';

export default function CreatorSafetyScreen({ navigation }) {
  const [filterComments, setFilterComments] = useState(true);
  const [hideOffensiveWords, setHideOffensiveWords] = useState(true);
  const [limitMessages, setLimitMessages] = useState(false);
  const [followersOnly, setFollowersOnly] = useState(false);
  const [allowMentions, setAllowMentions] = useState(true);
  const [liveModeration, setLiveModeration] = useState(true);
  const [reviewTags, setReviewTags] = useState(true);

  const showInfo = (title, message) => {
    Alert.alert(title, message);
  };

  const safetySettings = [
    {
      title: 'Comment filtering',
      description: 'Filter comments that may be harmful or abusive.',
      value: filterComments,
      setter: setFilterComments,
    },
    {
      title: 'Hide offensive words',
      description: 'Hide comments containing configured offensive words.',
      value: hideOffensiveWords,
      setter: setHideOffensiveWords,
    },
    {
      title: 'Limit direct messages',
      description: 'Reduce unwanted messages from unknown accounts.',
      value: limitMessages,
      setter: setLimitMessages,
    },
    {
      title: 'Followers-only messages',
      description: 'Allow direct messages from followers only.',
      value: followersOnly,
      setter: setFollowersOnly,
    },
    {
      title: 'Allow mentions',
      description: 'Allow other users to mention your account.',
      value: allowMentions,
      setter: setAllowMentions,
    },
    {
      title: 'Live-stream moderation',
      description: 'Enable moderation tools during your live streams.',
      value: liveModeration,
      setter: setLiveModeration,
    },
    {
      title: 'Review tags before display',
      description: 'Approve tags before they appear on your profile.',
      value: reviewTags,
      setter: setReviewTags,
    },
  ];

  const reportHelp = () => {
    Alert.alert(
      'Report a safety concern',
      'In the full KONNEKT app, this option will connect to a secure reporting system where reports can be reviewed by authorised moderators.'
    );
  };

  const blockedAccounts = () => {
    Alert.alert(
      'Blocked accounts',
      'The full app will let you view and manage accounts you have blocked.'
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

        <Text style={styles.headerTitle}>Creator Safety</Text>
        <Text style={styles.headerIcon}>🛡️</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🛡️</Text>
        <Text style={styles.heroTitle}>Your safety matters</Text>
        <Text style={styles.heroDescription}>
          Manage how people interact with you, protect your
          content and create a healthier community.
        </Text>
        <Text style={styles.previewLabel}>SAFETY SETTINGS PREVIEW</Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Important</Text>
        <Text style={styles.noticeText}>
          These switches currently change local screen settings only.
          They do not filter real comments, messages or accounts yet.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Interaction controls</Text>

      <View style={styles.settingsCard}>
        {safetySettings.map((setting, index) => (
          <View
            key={setting.title}
            style={[
              styles.settingRow,
              index !== safetySettings.length - 1 && styles.separator,
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                {setting.title}
              </Text>
              <Text style={styles.settingDescription}>
                {setting.description}
              </Text>
            </View>

            <Switch
              value={setting.value}
              onValueChange={setting.setter}
              trackColor={{
                false: '#D0D5DD',
                true: '#75B9A9',
              }}
              thumbColor={setting.value ? '#075E54' : '#F2F4F7'}
            />
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Account protection</Text>

      <View style={styles.settingsCard}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={blockedAccounts}
        >
          <Text style={styles.actionIcon}>🚫</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Blocked accounts</Text>
            <Text style={styles.actionDescription}>
              Manage accounts you do not want interacting with you.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={reportHelp}
        >
          <Text style={styles.actionIcon}>⚠️</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Report a safety concern</Text>
            <Text style={styles.actionDescription}>
              Learn how to report abuse or harmful behaviour.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => showInfo(
            'Account security',
            'Use a strong password, protect your verification codes and never share your login details.'
          )}
        >
          <Text style={styles.actionIcon}>🔐</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Account security tips</Text>
            <Text style={styles.actionDescription}>
              Protect your account from unauthorised access.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.guidelines}>
        <Text style={styles.guidelinesTitle}>
          Community safety reminders
        </Text>

        <Text style={styles.guideline}>
          • Do not share passwords or verification codes.
        </Text>
        <Text style={styles.guideline}>
          • Report threats, harassment and impersonation.
        </Text>
        <Text style={styles.guideline}>
          • Do not share another person's private information.
        </Text>
        <Text style={styles.guideline}>
          • Use trusted moderators during live streams.
        </Text>
        <Text style={styles.guideline}>
          • Keep evidence of serious threats when safe to do so.
        </Text>
      </View>

      <Text style={styles.footer}>
        KONNEKT safety tools will require secure backend
        enforcement, reporting workflows and moderation policies
        before they can protect real users.
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    padding: 23,
    borderRadius: 13,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 43,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 9,
  },
  heroDescription: {
    color: '#D1E7E3',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  previewLabel: {
    backgroundColor: '#FFFFFF',
    color: '#075E54',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 14,
  },
  notice: {
    backgroundColor: '#FFF7E8',
    marginHorizontal: 14,
    padding: 13,
    borderRadius: 9,
  },
  noticeTitle: {
    color: '#9A6700',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noticeText: {
    color: '#7A4F01',
    fontSize: 10,
    lineHeight: 16,
  },
  sectionTitle: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 21,
    marginBottom: 10,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    borderRadius: 10,
    paddingHorizontal: 13,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  settingDescription: {
    color: '#667085',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#EAECF0',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 11,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionDescription: {
    color: '#667085',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  arrow: {
    color: '#98A2B3',
    fontSize: 23,
    marginLeft: 8,
  },
  guidelines: {
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
    color: '#475467',
    fontSize: 10,
    lineHeight: 20,
  },
  footer: {
    color: '#98A2B3',
    fontSize: 9,
    lineHeight: 15,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
