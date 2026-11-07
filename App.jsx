import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './src/AuthContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';

/*
 * One navigation system for the whole KONNEKT web app.
 * Every screen containing JSX uses the .jsx extension for reliable Vite parsing.
 */
const discoveredScreens = import.meta.glob('./src/screens/*.jsx', {
  eager: true,
  import: 'default'
});

const screenRegistry = Object.fromEntries(
  Object.entries(discoveredScreens).map(([filePath, component]) => {
    const fileName = filePath.split('/').pop().replace(/\.(jsx|js)$/, '');
    const routeName = fileName.replace(/Screen$/, '');
    return [routeName, component];
  })
);

const routeAliases = {
  Reels: 'Watch',
  Discover: 'Discover',
  ChatMedia: 'ChatAttachments',
  CameraScreen: 'Camera',
  ShareContactScreen: 'ShareContact',
  ShareLocationScreen: 'ShareLocation'
};

const tabs = [
  { name: 'Chats', icon: '💬' },
  { name: 'Reels', icon: '🎬' },
  { name: 'Status', icon: '◉' },
  { name: 'Discover', icon: '⌕' },
  { name: 'Profile', icon: '👤' }
];

function AppShell() {
  const { session, user, loading, recovery } = useAuth();
  const [stack, setStack] = useState([{ name: 'Welcome', params: {} }]);

  useEffect(() => {
    if (!loading) setStack([{ name: recovery ? 'PasswordReset' : (session ? 'Chats' : 'Welcome'), params: {} }]);
  }, [loading, session?.user?.id, recovery]);

  const currentRoute = stack[stack.length - 1] || {
    name: 'Welcome',
    params: {}
  };

  const navigation = {
    navigate: (name, params = {}) => {
      setStack(previous => [...previous, { name, params }]);
    },
    goBack: () => {
      setStack(previous =>
        previous.length > 1 ? previous.slice(0, -1) : previous
      );
    },
    replace: (name, params = {}) => {
      setStack(previous => [
        ...previous.slice(0, -1),
        { name, params }
      ]);
    },
    getParam: name => currentRoute.params?.[name]
  };

  const openTab = name => {
    setStack([{ name, params: {} }]);
  };

  const screenKey = routeAliases[currentRoute.name] || currentRoute.name;
  const ActiveScreen = screenRegistry[screenKey];
  const isMainTab = tabs.some(tab => tab.name === currentRoute.name);

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.missingScreen}><Text style={styles.missingTitle}>KONNEKT</Text><Text style={styles.missingText}>Connecting securely…</Text></View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#080812" barStyle="light-content" />

      <View style={styles.screen}>
        {ActiveScreen ? (
          <ActiveScreen
            navigation={navigation}
            route={{ name: currentRoute.name, params: currentRoute.params || {} }}
            user={user}
            session={session}
          />
        ) : (
          <View style={styles.missingScreen}>
            <Text style={styles.missingTitle}>
              {currentRoute.name}
            </Text>
            <Text style={styles.missingText}>
              This section is not connected yet.
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.backButton}
              onPress={navigation.goBack}
            >
              <Text style={styles.backText}>← Go back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isMainTab && session && (
        <View style={styles.tabBar}>
          {tabs.map(tab => {
            const active = currentRoute.name === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                accessibilityRole="button"
                accessibilityLabel={tab.name}
                accessibilityState={{ selected: active }}
                style={styles.tab}
                onPress={() => openTab(tab.name)}
              >
                <Text style={[styles.tabIcon, active && styles.activeTabIcon]}>
                  {tab.icon}
                </Text>
                <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                  {tab.name}
                </Text>
                {active ? <View style={styles.activeLine} /> : null}
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
    minHeight: '100vh',
    backgroundColor: '#080812'
  },
  screen: {
    flex: 1,
    minHeight: 0
  },
  tabBar: {
    minHeight: 68,
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
    minHeight: 62
  },
  tabIcon: {
    color: '#8A99AD',
    fontSize: 21,
    marginBottom: 3
  },
  activeTabIcon: {
    color: '#168BFF'
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
    marginTop: 12,
    textAlign: 'center'
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

export default function App() { return <AuthProvider><AppShell /></AuthProvider>; }
