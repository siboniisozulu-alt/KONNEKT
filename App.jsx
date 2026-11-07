
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';

// Main KONNEKT screens
import ChatsScreen from './src/screens/ChatsScreen.jsx';
import WatchScreen from './src/screens/WatchScreen.jsx';
import StatusScreen from './src/screens/StatusScreen.jsx';
import ProfileScreen from './src/screens/ProfileScreen.jsx';
import HashtagScreen from './src/screens/HashtagScreen.jsx';

// Secondary screens
import ChatConversationScreen from './src/screens/ChatConversationScreen';
import NewChatScreen from './src/screens/NewChatScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import LoginScreen from './src/screens/LoginScreen';

const tabs = [
  { name: 'Chats', icon: '💬' },
  { name: 'Reels', icon: '🎬' },
  { name: 'Status', icon: '📸' },
  { name: 'Discover', icon: '🌍' },
  { name: 'Profile', icon: '👤' }
];

export default function App() {
  const [stack, setStack] = useState([
    { name: 'Chats', params: {} }
  ]);

  const currentRoute = stack[stack.length - 1];

  const navigation = {
    navigate: (name, params = {}) => {
      setStack(previous => [
        ...previous,
        { name, params }
      ]);
    },

    goBack: () => {
      setStack(previous =>
        previous.length > 1
          ? previous.slice(0, -1)
          : previous
      );
    },

    replace: (name, params = {}) => {
      setStack(previous => [
        ...previous.slice(0, -1),
        { name, params }
      ]);
    },

    getParam: (name) => currentRoute.params?.[name]
  };

  const openTab = (name) => {
    setStack([{ name, params: {} }]);
  };

  const screens = {
    Chats: ChatsScreen,
    Reels: WatchScreen,
    Watch: WatchScreen,
    Status: StatusScreen,
    Discover: HashtagScreen,
    Hashtag: HashtagScreen,
    Profile: ProfileScreen,
    ChatConversation: ChatConversationScreen,
    NewChat: NewChatScreen,
    AccountSettings: AccountSettingsScreen,
    Login: LoginScreen
  };

  const ActiveScreen = screens[currentRoute.name];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#080812"
        barStyle="light-content"
      />

      <View style={styles.screen}>
        {ActiveScreen ? (
          <ActiveScreen
            navigation={navigation}
            route={{
              name: currentRoute.name,
              params: currentRoute.params
            }}
          />
        ) : (
          <View style={styles.missingScreen}>
            <Text style={styles.missingTitle}>
              {currentRoute.name}
            </Text>
            <Text style={styles.missingText}>
              This screen still needs to be connected.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={navigation.goBack}
            >
              <Text style={styles.backText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {tabs.some(tab => tab.name === currentRoute.name) && (
        <View style={styles.tabBar}>
          {tabs.map(tab => {
            const active = currentRoute.name === tab.name;

            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => openTab(tab.name)}
              >
                <Text style={styles.tabIcon}>
                  {tab.icon}
                </Text>
                <Text
                  style={[
                    styles.tabLabel,
                    active && styles.activeTabLabel
                  ]}
                >
                  {tab.name}
                </Text>
                {active && <View style={styles.activeLine} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080812'
  },
  screen: {
    flex: 1
  },
  tabBar: {
    height: 68,
    flexDirection: 'row',
    backgroundColor: '#0D1424',
    borderTopWidth: 1,
    borderTopColor: '#263A53',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 5
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 62
  },
  tabIcon: {
    fontSize: 21,
    marginBottom: 3
  },
  tabLabel: {
    color: '#8A99AD',
    fontSize: 10,
    fontWeight: '600'
  },
  activeTabLabel: {
    color: '#168BFF'
  },
  activeLine: {
    width: 22,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#168BFF',
    marginTop: 4
  },
  missingScreen: {
    flex: 1,
    backgroundColor: '#07111F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25
  },
  missingTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold'
  },
  missingText: {
    color: '#B8C4D4',
    marginTop: 12
  },
  backButton: {
    backgroundColor: '#168BFF',
    padding: 14,
    borderRadius: 10,
    marginTop: 20
  },
  backText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
});
