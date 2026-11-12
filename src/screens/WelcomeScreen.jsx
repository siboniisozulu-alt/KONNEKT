import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoLetter}>K</Text>
        </View>

        <Text style={styles.brand}>KONNEKT</Text>
        <Text style={styles.tagline}>Connect. Create. Share.</Text>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.title}>Your world. Your people. Your KONNEKT.</Text>
        <Text style={styles.description}>
          Chat with friends, share your moments, watch amazing videos and go live.
          Everything you love about social media in one place.
        </Text>
      </View>

      <View style={styles.features}>
        {[
          ['💬', 'Private messaging'],
          ['📸', '24-hour statuses'],
          ['🎬', 'Short videos'],
          ['🔴', 'Live streaming'],
        ].map(([icon, label]) => (
          <View style={styles.feature} key={label}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureText}>{label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.signup} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupText}>SIGN UP</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.login} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>LOG IN</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Welcome to the KONNEKT community.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10091B' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 90, height: 90, borderRadius: 25, backgroundColor: '#6A0DAD', borderWidth: 2, borderColor: '#FFC107', alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: '#FFFFFF', fontSize: 52, fontWeight: 'bold' },
  brand: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', letterSpacing: 4, marginTop: 15 },
  tagline: { color: '#00E6FF', marginTop: 8, fontSize: 13, letterSpacing: 2 },
  welcome: { alignItems: 'center', marginBottom: 30 },
  title: { color: '#FFFFFF', fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  description: { color: '#D9CCE9', fontSize: 15, lineHeight: 24, textAlign: 'center' },
  features: { marginBottom: 30, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  feature: { width: '48%', backgroundColor: '#170D26', borderRadius: 14, borderWidth: 1, borderColor: '#39244B', padding: 16, marginBottom: 12, alignItems: 'center' },
  featureIcon: { fontSize: 30, marginBottom: 8 },
  featureText: { color: '#FFFFFF', fontSize: 12, textAlign: 'center' },
  signup: { backgroundColor: '#FF6B00', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  signupText: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 },
  login: { backgroundColor: '#3A0CA3', borderWidth: 1, borderColor: '#00E6FF', padding: 16, borderRadius: 12, alignItems: 'center' },
  loginText: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 },
  footer: { color: '#BBA9CC', textAlign: 'center', marginTop: 20, fontSize: 12 }
});
