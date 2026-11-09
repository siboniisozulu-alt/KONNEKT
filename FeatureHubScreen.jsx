import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const groups = [
  { title: 'COMMUNICATION', items: [
    ['＋', 'Start a new chat', 'NewChat'], ['👥', 'Create a group', 'CreateGroup'],
    ['📇', 'Find contacts', 'Contacts'], ['🔎', 'Search messages', 'ChatSearch'],
    ['⭐', 'Starred messages', 'StarredMessages'], ['📦', 'Archived chats', 'ArchivedChats'],
    ['🎙️', 'Voice notes', 'VoiceNote']
  ]},
  { title: 'SOCIAL & DISCOVERY', items: [
    ['🎬', 'Watch Reels', 'Watch'], ['＋', 'Create a post', 'Create'],
    ['◉', 'Create a status', 'CreateStatus'], ['⌕', 'Discover people', 'Discover'],
    ['#', 'Explore hashtags', 'Hashtag'], ['👥', 'Following', 'Following'],
    ['🔴', 'Start a live room', 'LiveStreamSetup'], ['💾', 'Saved videos', 'SavedVideos']
  ]},
  { title: 'CREATOR TOOLS', items: [
    ['🎨', 'Creator studio', 'CreatorStudio'], ['📊', 'Creator analytics', 'CreatorAnalytics'],
    ['💰', 'Creator earnings', 'CreatorEarnings'], ['💳', 'Monetisation overview', 'CreatorMonetization'],
    ['🏦', 'Payout settings', 'CreatorPayout'], ['🤝', 'Subscriptions', 'CreatorSubscriptions'],
    ['📣', 'Brand partnerships', 'CreatorBrandPartnerships'], ['🗂️', 'Manage creator content', 'CreatorContentManagement'],
    ['⚙️', 'Creator settings', 'CreatorSettings'], ['🛡️', 'Creator safety', 'CreatorSafety'],
    ['✓', 'Creator verification', 'CreatorVerification'], ['👤', 'Creator account overview', 'CreatorAccountOverview']
  ]},
  { title: 'ACCOUNT, PRIVACY & HELP', items: [
    ['🔔', 'Notifications', 'Notifications'], ['⚙️', 'Notification settings', 'NotificationSettings'],
    ['🔒', 'Privacy settings', 'PrivacySettings'], ['🛡️', 'Two-step verification', 'TwoStepVerification'],
    ['🔑', 'Change password', 'ChangePassword'], ['🔐', 'Encryption key recovery', 'KeyRecovery'],
    ['🚫', 'Blocked accounts', 'BlockedContacts'], ['📱', 'Active sessions', 'ActiveSessions'],
    ['📜', 'Terms and privacy', 'TermsPrivacy'], ['❔', 'Help and support', 'HelpSupport']
  ]}
];

export default function FeatureHubScreen({ navigation }) {
  return <ScrollView style={s.page} contentContainerStyle={s.content}>
    <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button"><Text style={s.back}>‹ Back</Text></TouchableOpacity>
    <Text style={s.title}>KONNEKT feature centre</Text>
    <Text style={s.subtitle}>Shortcuts to the features included in this beta build. Some services require setup or testing before they can work in the background or at production scale.</Text>
    {groups.map(group => <View key={group.title} style={s.group}>
      <Text style={s.groupTitle}>{group.title}</Text>
      {group.items.map(([icon, label, route]) => <TouchableOpacity key={route} style={s.item} accessibilityRole="button" accessibilityLabel={label} onPress={() => navigation.navigate(route)}>
        <Text style={s.icon}>{icon}</Text><Text style={s.label}>{label}</Text><Text style={s.arrow}>›</Text>
      </TouchableOpacity>)}
    </View>)}
    <Text style={s.foot}>KONNEKT · Connecting people everywhere.</Text>
  </ScrollView>;
}
const s = StyleSheet.create({
  page:{flex:1,backgroundColor:'#07111F'},content:{padding:18,paddingTop:26,paddingBottom:45},back:{color:'#79BFFF',fontSize:16,fontWeight:'700',marginBottom:18},title:{color:'#FFF',fontSize:27,fontWeight:'800'},subtitle:{color:'#9CB0C7',fontSize:13,lineHeight:20,marginTop:9,marginBottom:22},group:{marginBottom:20},groupTitle:{color:'#8EBBEE',fontSize:11,fontWeight:'800',letterSpacing:1.2,marginBottom:9},item:{minHeight:52,backgroundColor:'#12243A',borderWidth:1,borderColor:'#233D5B',borderRadius:12,marginBottom:8,paddingHorizontal:13,flexDirection:'row',alignItems:'center'},icon:{width:34,fontSize:19},label:{color:'#F1F6FC',fontSize:14,fontWeight:'600',flex:1},arrow:{color:'#69B5FF',fontSize:25},foot:{color:'#6F849B',textAlign:'center',fontSize:11,marginTop:10}
});
