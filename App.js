
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

export default function App() {
  const handleLogin = () => {
    Alert.alert(
      'KONNEKT Login',
      'Phone number login will be connected in our authentication files.'
    );
  };

  const handleSignUp = () => {
    Alert.alert(
      'Join KONNEKT',
      'Phone number registration will be connected in our authentication files.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#071426"
        barStyle="light-content"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>K</Text>
          </View>

          <Text style={styles.logoText}>KONNEKT</Text>
          <Text style={styles.tagline}>
            Connect. Create. Share.
          </Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>
            Welcome to KONNEKT!
          </Text>

          <Text style={styles.description}>
            Your social world, all in one place.
            {'\n\n'}
            Chat with friends, share your status,
            discover videos, create content and
            connect with people through live streams.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Chat</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureText}>Status</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎬</Text>
            <Text style={styles.featureText}>Videos</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔴</Text>
            <Text style={styles.featureText}>Live</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpText}>
              CREATE ACCOUNT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginText}>
              LOG IN
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          One app. Endless connections.
        </Text>

        <Text style={styles.version}>
          KONNEKT © 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071426',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 35,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 45,
  },

  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 25,
    backgroundColor: '#168BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 8,
  },

  logoLetter: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  logoText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
  },

  tagline: {
    fontSize: 14,
    color: '#55B5FF',
    marginTop: 8,
    letterSpacing: 2,
  },

  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  welcomeTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },

  description: {
    fontSize: 15,
    lineHeight: 25,
    color: '#B7C8DC',
    textAlign: 'center',
  },

  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },

  feature: {
    alignItems: 'center',
    backgroundColor: '#102640',
    borderRadius: 15,
    paddingVertical: 15,
    width: '22%',
  },

  featureIcon: {
    fontSize: 25,
    marginBottom: 8,
  },

  featureText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  buttons: {
    gap: 15,
  },

  signUpButton: {
    backgroundColor: '#168BFF',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },

  signUpText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  loginButton: {
    borderWidth: 1.5,
    borderColor: '#168BFF',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },

  loginText: {
    color: '#55B5FF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  footer: {
    color: '#B7C8DC',
    textAlign: 'center',
    marginTop: 35,
    fontSize: 13,
  },

  version: {
    color: '#657A92',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 11,
  },
});
