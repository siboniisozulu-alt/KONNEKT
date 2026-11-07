
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function MessageInfoScreen({ navigation, route }) {
  const message = route?.params?.message || {
    text: 'Hello! How are you?',
    time: '10:30',
    date: 'Today',
    status: 'read',
  };

  const recipients = route?.params?.recipients || [
    {
      id: '1',
      name: 'Thabo',
      sent: '10:30',
      delivered: '10:31',
      read: '10:35',
    },
    {
      id: '2',
      name: 'Lerato',
      sent: '10:30',
      delivered: '10:32',
      read: null,
    },
  ];

  const getStatus = (recipient) => {
    if (recipient.read) return 'Read';
    if (recipient.delivered) return 'Delivered';
    if (recipient.sent) return 'Sent';
    return 'Pending';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Message info</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.messageSection}>
          <Text style={styles.sectionTitle}>YOUR MESSAGE</Text>

          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.messageTime}>
              {message.date} · {message.time}
            </Text>
          </View>
        </View>

        <View style={styles.statusSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DELIVERY INFORMATION</Text>
            <Text style={styles.total}>
              {recipients.length} recipients
            </Text>
          </View>

          {recipients.map((recipient) => (
            <View key={recipient.id} style={styles.recipientCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {recipient.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>
                  {recipient.name}
                </Text>

                <Text style={styles.statusText}>
                  {getStatus(recipient)}
                </Text>

                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Sent:</Text>
                  <Text style={styles.timeValue}>
                    {recipient.sent || 'Pending'}
                  </Text>
                </View>

                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Delivered:</Text>
                  <Text style={styles.timeValue}>
                    {recipient.delivered || 'Not delivered'}
                  </Text>
                </View>

                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Read:</Text>
                  <Text style={styles.timeValue}>
                    {recipient.read || 'Not read'}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.statusIcon,
                  recipient.read
                    ? styles.readIcon
                    : styles.unreadIcon,
                ]}
              >
                {recipient.read ? '✓✓' : recipient.delivered ? '✓✓' : '✓'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Delivery and read information will update automatically
            once KONNEKT messaging is connected to its live backend.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  header: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  back: {
    color: '#FFFFFF',
    fontSize: 32,
    marginRight: 18,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  messageSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  messageBubble: {
    backgroundColor: '#DCF8C6',
    padding: 15,
    borderRadius: 12,
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  messageText: {
    color: '#17202A',
    fontSize: 14,
    lineHeight: 21,
  },
  messageTime: {
    color: '#667085',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 9,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    color: '#98A2B3',
    fontSize: 10,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F2',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D9EEE9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#075E54',
    fontSize: 17,
    fontWeight: 'bold',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    color: '#17202A',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusText: {
    color: '#075E54',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 7,
  },
  timeRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  timeLabel: {
    width: 75,
    color: '#98A2B3',
    fontSize: 10,
  },
  timeValue: {
    color: '#475467',
    fontSize: 10,
  },
  statusIcon: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
    marginTop: 4,
  },
  readIcon: {
    color: '#34B7F1',
  },
  unreadIcon: {
    color: '#98A2B3',
  },
  note: {
    backgroundColor: '#EAF2F1',
    padding: 13,
    borderRadius: 10,
    marginTop: 18,
  },
  noteText: {
    color: '#526B67',
    fontSize: 11,
    lineHeight: 17,
  },
});
