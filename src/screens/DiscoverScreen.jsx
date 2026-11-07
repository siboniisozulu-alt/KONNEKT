
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';

export default function DiscoverScreen({ navigation }) {
  const categories = [
    { icon: '🎬', title: 'Trending Reels', description: 'Watch what everyone is sharing.' },
    { icon: '👥', title: 'People', description: 'Find new people and make connections.' },
    { icon: '🌍', title: 'Communities', description: 'Explore communities and interests.' },
    { icon: '📸', title: 'Public Status', description: 'See updates from the KONNEKT community.' },
    { icon: '🔥', title: 'Trending', description: 'Discover what is popular right now.' },
    { icon: '✨', title: 'Explore', description: 'Find something new on KONNEKT.' }
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>KONNEKT</Text>
          <Text style={styles.heading}>Discover</Text>
          <Text style={styles.subtitle}>
            Explore. Connect. Discover something new.
          </Text>
        </View>

        <View style={styles.search}>
          <Text style={styles.searchText}>⌕  Search KONNEKT</Text>
        </View>

        <Text style={styles.sectionTitle}>Explore KONNEKT</Text>

        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => {
              if (item.title === 'Trending Reels') {
                navigation.navigate('Reels');
              }
            }}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            KONNEKT — Connecting people everywhere.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080812'
  },
  header: {
    padding: 24,
    paddingTop: 30
  },
  logo: {
    color: '#168BFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 3
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 22
  },
  subtitle: {
    color: '#9AA9BD',
    fontSize: 14,
    marginTop: 8
  },
  search: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#111C30',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#263A53',
    marginBottom: 28
  },
  searchText: {
    color: '#8294AA',
    fontSize: 14
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101B2D',
    borderWidth: 1,
    borderColor: '#233750',
    borderRadius: 15,
    padding: 17,
    marginHorizontal: 20,
    marginBottom: 12
  },
  icon: {
    fontSize: 27,
    marginRight: 15
  },
  cardContent: {
    flex: 1
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold'
  },
  description: {
    color: '#91A1B5',
    fontSize: 12,
    marginTop: 5
  },
  arrow: {
    color: '#168BFF',
    fontSize: 25
  },
  footer: {
    padding: 30,
    alignItems: 'center'
  },
  footerText: {
    color: '#64758B',
    fontSize: 11
  }
});
