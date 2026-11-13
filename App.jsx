import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './src/AuthContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { supabase } from './src/lib_supabase';
import './src/konnekt-theme.css';

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
  Updates: 'Status',
  Status: 'Status',
  Discover: 'Discover',
  ChatMedia: 'ChatAttachments',
  CameraScreen: 'Camera',
  ShareContactScreen: 'ShareContact',
  ShareLocationScreen: 'ShareLocation'
};

const tabs = [
  { name: 'Reels', icon: 'play-square' },
  { name: 'Chats', icon: 'message-circle' },
  { name: 'Status', icon: 'circle-dot' },
  { name: 'Discover', icon: 'compass' },
  { name: 'Calls', icon: 'phone' },
  { name: 'Profile', icon: 'user-round' }
];

const tabIcons = {
  'message-circle': '✉',
  'circle-dot': '◉',
  'play-square': '▶',
  phone: '☎',
  compass: '◎',
  'user-round': '◌'
};

function AppShell() {
  const { session, user, loading, recovery } = useAuth();
  const [stack, setStack] = useState([{ name: 'Welcome', params: {} }]);
  const [lightMode, setLightMode] = useState(false);
  const seenIncomingCalls = React.useRef(new Set());

useEffect(() => {
  if (!loading) {
    setStack([{
      name: recovery ? 'PasswordReset' : 'Welcome',
      params: {}
    }]);
  }
}, [loading, recovery]);
    supabase.from('call_sessions').select('*').eq('callee_id', user.id).eq('status', 'ringing').order('created_at', { ascending: false }).limit(1).then(({ data }) => { if (data?.[0]) showIncoming(data[0]); });
    const showGroupInvite = async invite => {
      if (!active || !invite?.call_id || invite.user_id !== user.id || invite.status !== 'invited' || seenIncomingCalls.current.has(`group-${invite.call_id}`)) return;
      seenIncomingCalls.current.add(`group-${invite.call_id}`);
      const { data: call } = await supabase.from('group_call_sessions').select('id,conversation_id,call_type,created_by,status').eq('id', invite.call_id).maybeSingle();
      if (!active || !call || call.status === 'ended') return;
      const { data: conversation } = await supabase.from('conversations').select('title').eq('id', call.conversation_id).maybeSingle();
      Alert.alert('Group call invitation', `Join ${conversation?.title || 'a KONNEKT group'}?`, [
        { text: 'Decline', style: 'cancel', onPress: () => supabase.from('group_call_participants').update({ status: 'declined' }).eq('call_id', call.id).eq('user_id', user.id).then(() => {}) },
        { text: 'Join', onPress: () => setStack(previous => [...previous, { name: 'GroupCall', params: { callId: call.id, conversationId: call.conversation_id, callType: call.call_type, groupName: conversation?.title || 'KONNEKT group' } }]) }
      ]);
    };
    const channel = supabase.channel(`incoming-calls-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_sessions', filter: `callee_id=eq.${user.id}` }, payload => showIncoming(payload.new))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_call_participants', filter: `user_id=eq.${user.id}` }, payload => showGroupInvite(payload.new))
      .subscribe();
    supabase.from('group_call_participants').select('call_id,user_id,status').eq('user_id', user.id).eq('status', 'invited').then(({ data }) => { if (data?.length) showGroupInvite(data[0]); });
    return () => { active = false; supabase.removeChannel(channel); };
  }, [user?.id]);

  const currentRoute = stack[stack.length - 1] || { name: 'Welcome', params: {} };

  const navigate = useCallback((name, params = {}) => { setStack(previous => [...previous, { name, params }]); }, []);
  const goBack = useCallback(() => { setStack(previous => previous.length > 1 ? previous.slice(0, -1) : previous); }, []);
  const replace = useCallback((name, params = {}) => { setStack(previous => [...previous.slice(0, -1), { name, params }]); }, []);
  const navigation = useMemo(() => ({ navigate, goBack, replace, getParam: name => currentRoute.params?.[name] }), [navigate, goBack, replace, currentRoute.params]);

  const openTab = useCallback(name => { setStack([{ name, params: {} }]); }, []);

  const screenKey = routeAliases[currentRoute.name] || currentRoute.name;
  const ActiveScreen = screenRegistry[screenKey];
  const isMainTab = tabs.some(tab => tab.name === currentRoute.name);

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.missingScreen}><Text style={styles.missingTitle}>KONNEKT</Text><Text style={styles.missingText}>Connecting securely…</Text></View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className={lightMode ? 'konnekt-light' : 'konnekt-dark'} style={[styles.container, lightMode && styles.lightContainer]} testID="konnekt-app-shell">
      <StatusBar backgroundColor={lightMode ? '#F7F3FC' : '#10091B'} barStyle={lightMode ? 'dark-content' : 'light-content'} />
      {isMainTab && session && (
        <View style={styles.brandBar}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>K</Text></View>
          <View style={styles.brandCopy}><Text style={styles.brandName}>KONNEKT</Text><Text style={styles.brandTagline}>Connecting people everywhere.</Text></View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={lightMode ? 'Switch to dark mode' : 'Switch to light mode'} style={styles.themeToggle} onPress={() => setLightMode(value => !value)}>
            <Text style={styles.themeToggleText}>{lightMode ? '☾' : '☀'}</Text>
          </TouchableOpacity>
        </View>
      )}
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
            <Text style={styles.missingTitle}>{currentRoute.name}</Text>
            <Text style={styles.missingText}>This feature is not available in this build.</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.backButton} onPress={navigation.goBack}>
              <Text style={styles.backText}>← Go back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isMainTab && session && (
        <View style={styles.tabBar} accessibilityRole="tablist">
          {tabs.map(tab => {
            const active = currentRoute.name === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                accessibilityRole="button"
                accessibilityLabel={tab.name}
                accessibilityState={{ selected: active }}
                style={[styles.tab, active && styles.activeTab]}
                onPress={() => openTab(tab.name)}
              >
                <Text style={[styles.tabIcon, active && styles.activeTabIcon]}>{tabIcons[tab.icon] || '•'}</Text>
                <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{tab.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: '100vh', backgroundColor: '#10091B' },
  lightContainer: { backgroundColor: '#F7F3FC' },
  brandBar: { minHeight: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#170D26', borderBottomWidth: 1, borderBottomColor: '#39244B' },
  brandMark: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#6A0DAD', borderWidth: 1, borderColor: '#FFC107', alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#FFFFFF', fontWeight: '900', fontSize: 19 },
  brandCopy: { marginLeft: 10, flex: 1 },
  brandName: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 2, fontSize: 14 },
  brandTagline: { color: '#BBA9CC', fontSize: 9, marginTop: 2 },
  themeToggle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#30203F', alignItems: 'center', justifyContent: 'center' },
  themeToggleText: { color: '#FFC107', fontSize: 21 },
  screen: { flex: 1, minHeight: 0 },
  tabBar: { minHeight: 68, flexDirection: 'row', backgroundColor: '#170D26', borderTopWidth: 1, borderTopColor: '#39244B', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 6 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 58, paddingHorizontal: 2, borderTopWidth: 2, borderTopColor: 'transparent' },
  activeTab: { borderTopColor: '#FF6B00' },
  tabIcon: { color: '#A998B8', fontSize: 18, marginBottom: 2 },
  activeTabIcon: { color: '#FFC107' },
  tabLabel: { color: '#A998B8', fontSize: 9, fontWeight: '600' },
  activeTabLabel: { color: '#FFC107' },
  missingScreen: { flex: 1, backgroundColor: '#10091B', justifyContent: 'center', alignItems: 'center', padding: 25 },
  missingTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  missingText: { color: '#B8C4D4', marginTop: 12, textAlign: 'center' },
  backButton: { backgroundColor: '#FF6B00', padding: 14, borderRadius: 10, marginTop: 20 },
  backText: { color: '#FFFFFF', fontWeight: 'bold' }
});

export default function App() { return <AuthProvider><AppShell /></AuthProvider>; }
