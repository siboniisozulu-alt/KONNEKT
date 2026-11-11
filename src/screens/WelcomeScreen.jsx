
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
        <Text style={styles.tagline}>
          Connect. Create. Share.
        </Text>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.title}>
          Your world. Your people. Your KONNEKT.
        </Text>

        <Text style={styles.description}>
          Chat with friends, share your moments,
          watch amazing videos and go live.
          Everything you love about social media
          in one place.
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

      <TouchableOpacity
        style={styles.signup}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.signupText}>
          SIGN UP
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.login}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginText}>
          LOG IN
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Welcome to the KONNEKT community.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071426',
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  logo: {
    width: 85,
    height: 85,
    borderRadius: 25,
    backgroundColor: '#6A0DAD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoLetter: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: 'bold',
  },

  brand: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginTop: 15,
  },

  tagline: {
    color: '#55B5FF',
    marginTop: 8,
    fontSize: 13,
    letterSpacing: 2,
  },

  welcome: {
    alignItems: 'center',
    marginBottom: 30,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },

  description: {
    color: '#B7C8DC',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },

  features: {
    marginBottom: 30,
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#102640',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  featureIcon: {
    fontSize: 23,
    marginRight: 15,
  },

  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  signup: {
    backgroundColor: '#6A0DAD',
    padding: 18,
    borderRadius: 13,
    alignItems: 'center',
    marginBottom: 13,
  },

  signupText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  login: {
    borderWidth: 1.5,
    borderColor: '#6A0DAD',
    padding: 18,
    borderRadius: 13,
    alignItems: 'center',
  },

  loginText: {
    color: '#55B5FF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  footer: {
    color: '#657A92',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 25,
  },
});
