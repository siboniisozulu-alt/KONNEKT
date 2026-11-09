import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './src/AuthContext';
import { supabase } from './src/lib_supabase';
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
  const handledIncomingCall = useRef(new Set());
  const handledGroupCalls = useRef(new Set());

  useEffect(() => {
    if (!loading) setStack([{ name: recovery ? 'PasswordReset' : (session ? 'Chats' : 'Welcome'), params: {} }]);
  }, [loading, session?.user?.id, recovery]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const openIncoming = async call => {
      if (!call?.id || handledIncomingCall.current.has(call.id) || call.callee_id !== user.id || call.status !== 'ringing') return;
      handledIncomingCall.current.add(call.id);
      const { data: caller } = await supabase.from('profiles').select('id,username,full_name,avatar_url').eq('id', call.caller_id).maybeSingle();
      setStack(previous => {
        if (previous.some(item => item.params?.callId === call.id)) return previous;
        return [...previous, { name: 'Call', params: { callId: call.id, isCaller: false, incoming: true, callType: call.call_type, contact: { name: caller?.full_name || caller?.username || 'KONNEKT member', username: caller?.username ? `@${caller.username}` : '' } } }];
      });
    };
    supabase.from('call_sessions').select('*').eq('callee_id', user.id).eq('status', 'ringing').order('created_at', { ascending: false }).limit(1).then(({ data }) => { if (data?.[0]) openIncoming(data[0]); });
    const channel = supabase.channel(`incoming-calls-${user.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_sessions', filter: `callee_id=eq.${user.id}` }, payload => openIncoming(payload.new)).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const openGroupInvite = async participant => {
      if (!participant?.call_id || participant.user_id !== user.id || participant.status !== 'invited' || handledGroupCalls.current.has(participant.call_id)) return;
      handledGroupCalls.current.add(participant.call_id);
      const { data: call } = await supabase.from('group_call_sessions').select('id,conversation_id,call_type,status').eq('id', participant.call_id).maybeSingle();
      if (!call || call.status === 'ended') return;
      const { data: conversation } = await supabase.from('conversations').select('title').eq('id', call.conversation_id).maybeSingle();
      setStack(previous => previous.some(item => item.params?.callId === call.id) ? previous : [...previous, { name: 'GroupCall', params: { callId: call.id, conversationId: call.conversation_id, callType: call.call_type, groupName: conversation?.title || 'KONNEKT group' } }]);
    };
    supabase.from('group_call_participants').select('call_id,user_id,status').eq('user_id', user.id).eq('status', 'invited').then(({ data }) => { (data || []).forEach(openGroupInvite); });
    const channel = supabase.channel(`group-call-invites-${user.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_call_participants', filter: `user_id=eq.${user.id}` }, payload => openGroupInvite(payload.new)).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

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
