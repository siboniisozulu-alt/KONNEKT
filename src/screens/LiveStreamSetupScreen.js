
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';

const categories = [
  'Entertainment',
  'Music',
  'Gaming',
  'Education',
  'Comedy',
  'Lifestyle',
  'Sports',
  'Other',
];

const audiences = [
  'Everyone',
  'Followers',
  'Private',
];

export default function LiveStreamSetupScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [audience, setAudience] = useState('Everyone');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  const startLive = () => {
    if (!title.trim()) {
      Alert.alert(
        'Add a title',
        'Please enter a title for your live stream.'
      );
      return;
    }

    navigation.navigate('LiveStream', {
      title: title.trim(),
      category,
      audience,
      chatEnabled,
      commentsEnabled,
    });
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

        <Text style={styles.headerTitle}>Go Live</Text>

        <View style={{ width: 45 }} />
      </View>

      <View style={styles.preview}>
        <Text style={styles.cameraIcon}>📹</Text>
        <Text style={styles.previewTitle}>Live preview</Text>
        <Text style={styles.previewSubtitle}>
          Your camera preview will appear here when connected.
        </Text>
      </View>

      <Text style={styles.label}>LIVE STREAM TITLE</Text>

      <TextInput
        style={styles.input}
        placeholder="What are you going live about?"
        placeholderTextColor="#98A2B3"
        value={title}
        onChangeText={setTitle}
        maxLength={80}
      />

      <Text style={styles.characterCount}>
        {title.length}/80
      </Text>

      <Text style={styles.label}>CATEGORY</Text>

      <View style={styles.options}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.option,
              category === item && styles.selectedOption,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.optionText,
                category === item && styles.selectedOptionText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>WHO CAN WATCH?</Text>

      <View style={styles.audienceContainer}>
        {audiences.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.audienceOption,
              audience === item && styles.selectedAudience,
            ]}
            onPress={() => setAudience(item)}
          >
            <View style={styles.radio}>
              {audience === item && (
                <View style={styles.radioInner} />
              )}
            </View>

            <View>
              <Text style={styles.audienceTitle}>{item}</Text>

              <Text style={styles.audienceDescription}>
                {item === 'Everyone'
                  ? 'Anyone can watch your live.'
                  : item === 'Followers'
                  ? 'Only your followers can watch.'
                  : 'A private live session.'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>LIVE SETTINGS</Text>

      <View style={styles.setting}>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Live chat</Text>
          <Text style={styles.settingDescription}>
            Allow viewers to send messages.
          </Text>
        </View>

        <Switch
          value={chatEnabled}
          onValueChange={setChatEnabled}
          trackColor={{ false: '#D0D5DD', true: '#75B8A8' }}
          thumbColor={chatEnabled ? '#075E54' : '#F4F4F4'}
        />
      </View>

      <View style={styles.setting}>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Viewer comments</Text>
          <Text style={styles.settingDescription}>
            Allow comments during your stream.
          </Text>
        </View>

        <Switch
          value={commentsEnabled}
          onValueChange={setCommentsEnabled}
          trackColor={{ false: '#D0D5DD', true: '#75B8A8' }}
          thumbColor={commentsEnabled ? '#075E54' : '#F4F4F4'}
        />
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={startLive}
      >
        <Text style={styles.startButtonText}>
          🔴  START LIVE STREAM
        </Text>
      </TouchableOpacity>

      <Text style={styles.notice}>
        Please follow KONNEKT Community Guidelines.
        Harmful or prohibited content may be removed.
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
    paddingBottom: 35,
  },
  header: {
    backgroundColor: '#075E54',
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  preview: {
    height: 190,
    margin: 16,
    backgroundColor: '#182C2A',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cameraIcon: {
    fontSize: 43,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
  },
  previewSubtitle: {
    color: '#B8C9C5',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 7,
  },
  label: {
    color: '#667085',
    fontSize: 10,
    fontWeight: 'bold',
    marginHorizontal: 17,
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 14,
    color: '#17202A',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  characterCount: {
    color: '#98A2B3',
    fontSize: 10,
    textAlign: 'right',
    marginHorizontal: 18,
    marginTop: 5,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 13,
  },
  option: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    margin: 4,
  },
  selectedOption: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  optionText: {
    color: '#475467',
    fontSize: 11,
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  audienceContainer: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 13,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  selectedAudience: {
    backgroundColor: '#F0F8F5',
  },
  radio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#075E54',
  },
  audienceTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  audienceDescription: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 4,
  },
  setting: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    color: '#17202A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingDescription: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#D92D20',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  notice: {
    color: '#98A2B3',
    fontSize: 9,
    textAlign: 'center',
    marginHorizontal: 25,
    marginTop: 13,
    lineHeight: 15,
  },
});
