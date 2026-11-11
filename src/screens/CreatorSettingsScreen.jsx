
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

export default function CreatorSettingsScreen({ navigation }) {
  const [professionalAccount, setProfessionalAccount] = useState(true);
  const [showFollowerCount, setShowFollowerCount] = useState(true);
  const [allowRemixes, setAllowRemixes] = useState(true);
  const [allowLiveInvites, setAllowLiveInvites] = useState(true);
  const [creatorNotifications, setCreatorNotifications] = useState(true);
  const [campaignNotifications, setCampaignNotifications] = useState(true);
  const [showCreatorCategory, setShowCreatorCategory] = useState(true);

  const settings = [
    {
      title: 'Professional creator account',
      description: 'Enable creator-focused profile features.',
      value: professionalAccount,
      setter: setProfessionalAccount,
    },
    {
      title: 'Show follower count',
      description: 'Display your follower count on your profile.',
      value: showFollowerCount,
      setter: setShowFollowerCount,
    },
    {
      title: 'Allow content remixes',
      description: 'Let others create permitted remixes of your videos.',
      value: allowRemixes,
      setter: setAllowRemixes,
    },
    {
      title: 'Allow live invitations',
      description: 'Allow eligible users to invite you into live sessions.',
      value: allowLiveInvites,
      setter: setAllowLiveInvites,
    },
    {
      title: 'Creator notifications',
      description: 'Receive alerts about creator activity.',
      value: creatorNotifications,
      setter: setCreatorNotifications,
    },
    {
      title: 'Brand campaign notifications',
      description: 'Receive alerts about partnership opportunities.',
      value: campaignNotifications,
      setter: setCampaignNotifications,
    },
    {
      title: 'Show creator category',
      description: 'Display your selected creator category publicly.',
      value: showCreatorCategory,
      setter: setShowCreatorCategory,
    },
  ];

  const openTool = (screen, title) => {
    if (navigation?.navigate) {
      navigation.navigate(screen);
    } else {
      Alert.alert(title, 'This screen will be connected through navigation.');
    }
  };

  const showAccountInfo = () => {
    Alert.alert(
      'Creator account',
      'Creator settings in this prototype are stored only in local screen state. Real settings will need secure account storage.'
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

        <Text style={styles.headerTitle}>Creator Settings</Text>
        <Text style={styles.headerIcon}>⚙️</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🎨</Text>
        <Text style={styles.heroTitle}>Manage your creator account</Text>
        <Text style={styles.heroDescription}>
          Personalise your creator experience and control
          how your audience interacts with your content.
        </Text>
        <Text style={styles.previewLabel}>CREATOR SETTINGS</Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Prototype notice</Text>
        <Text style={styles.noticeText}>
          These preferences currently affect this screen only.
          They are not yet saved to a KONNEKT account or backend.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Creator preferences</Text>

      <View style={styles.settingsCard}>
        {settings.map((setting, index) => (
          <View
            key={setting.title}
            style={[
              styles.settingRow,
              index !== settings.length - 1 && styles.separator,
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

      <Text style={styles.sectionTitle}>Creator tools</Text>

      <View style={styles.toolsCard}>
        <TouchableOpacity
          style={styles.toolRow}
          onPress={() => openTool('CreatorStudio', 'Creator Studio')}
        >
          <Text style={styles.toolIcon}>📊</Text>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Creator Studio</Text>
            <Text style={styles.toolDescription}>
              Manage your creator dashboard and performance.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.toolRow}
          onPress={() => openTool('CreatorEarnings', 'Creator Earnings')}
        >
          <Text style={styles.toolIcon}>💰</Text>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Creator Earnings</Text>
            <Text style={styles.toolDescription}>
              View the proposed earnings dashboard.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.toolRow}
          onPress={() => openTool('CreatorVerification', 'Verification')}
        >
          <Text style={styles.toolIcon}>🔵</Text>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Creator Verification</Text>
            <Text style={styles.toolDescription}>
              Review creator verification requirements.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.toolRow}
          onPress={() => openTool('CreatorSafety', 'Creator Safety')}
        >
          <Text style={styles.toolIcon}>🛡️</Text>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Creator Safety</Text>
            <Text style={styles.toolDescription}>
              Review creator safety requirements.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.toolRow}
          onPress={() => openTool('CreatorBrandPartnerships', 'Brand Partnerships')}
        >
          <Text style={styles.toolIcon}>🤝</Text>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Brand Partnerships</Text>
            <Text style={styles.toolDescription}>
              View brand partnership availability.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.toolRow}
          onPress={() => openTool('CreatorContentManagement', 'My Content')}
        >
          <Text style={styles.toolIcon}>🎞️</Text>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>My Content</Text>
            <Text style={styles.toolDescription}>
              Manage published videos and draft examples.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.infoButton}
        onPress={showAccountInfo}
      >
        <Text style={styles.infoButtonText}>
          ABOUT CREATOR SETTINGS
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Some creator features may require account eligibility,
        safety checks and future platform approval.
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
    padding: 22,
    borderRadius: 12,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 42,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
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
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 13,
  },
  notice: {
    backgroundColor: '#FFF7E8',
    marginHorizontal: 14,
    padding: 13,
    borderRadius: 9,
  },
  noticeTitle: {
    color: '#9A6700',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noticeText: {
    color: '#7A4F01',
    fontSize: 9,
    lineHeight: 15,
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
    paddingHorizontal: 13,
    borderRadius: 10,
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
    fontSize: 10,
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
  toolsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    paddingHorizontal: 13,
    borderRadius: 10,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  toolIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    color: '#17202A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  toolDescription: {
    color: '#667085',
    fontSize: 9,
    marginTop: 4,
  },
  arrow: {
    color: '#98A2B3',
    fontSize: 23,
    marginLeft: 8,
  },
  infoButton: {
    backgroundColor: '#E8F4F1',
    marginHorizontal: 14,
    marginTop: 15,
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
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
    marginTop: 15,
  },
});
