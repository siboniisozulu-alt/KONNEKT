
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function StatusPrivacyScreen({ navigation, route }) {
  const [privacy, setPrivacy] = useState('contacts');

  const [excludedContacts, setExcludedContacts] = useState([]);

  const options = [
    {
      id: 'contacts',
      title: 'My Contacts',
      description: 'All your contacts can see your status.',
    },
    {
      id: 'except',
      title: 'My Contacts Except...',
      description: 'Choose contacts who cannot see your status.',
    },
    {
      id: 'only',
      title: 'Only Share With...',
      description: 'Choose specific contacts who can see your status.',
    },
  ];

  const sampleContacts = [
    { id: '1', name: 'Thabo Mokoena' },
    { id: '2', name: 'Lerato Dlamini' },
    { id: '3', name: 'Sipho Nkosi' },
    { id: '4', name: 'Amahle Zulu' },
    { id: '5', name: 'Nomsa Khumalo' },
  ];

  const toggleContact = (id) => {
    setExcludedContacts((previous) =>
      previous.includes(id)
        ? previous.filter((contactId) => contactId !== id)
        : [...previous, id]
    );
  };

  const savePrivacy = () => {
    const settings = {
      privacy,
      selectedContacts: excludedContacts,
    };

    if (route?.params?.onSave) {
      route.params.onSave(settings);
    }

    Alert.alert(
      'KONNEKT',
      'Your status privacy preference has been selected. It will be saved to your account when backend integration is added.'
    );

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Status Privacy</Text>
      </View>

      <Text style={styles.heading}>Who can see my status?</Text>

      <Text style={styles.description}>
        Choose who can view the photos, videos and updates
        you share on KONNEKT.
      </Text>

      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={styles.option}
          onPress={() => setPrivacy(option.id)}
        >
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionDescription}>
              {option.description}
            </Text>
          </View>

          <View style={styles.radioOuter}>
            {privacy === option.id && (
              <View style={styles.radioInner} />
            )}
          </View>
        </TouchableOpacity>
      ))}

      {privacy !== 'contacts' && (
        <View style={styles.contactsSection}>
          <Text style={styles.contactsHeading}>
            {privacy === 'except'
              ? 'Exclude contacts'
              : 'Share with selected contacts'}
          </Text>

          {sampleContacts.map((contact) => {
            const selected = excludedContacts.includes(contact.id);

            return (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactRow}
                onPress={() => toggleContact(contact.id)}
              >
                <Text style={styles.contactName}>
                  {contact.name}
                </Text>

                <View
                  style={[
                    styles.checkbox,
                    selected && styles.checkboxSelected,
                  ]}
                >
                  {selected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={savePrivacy}
      >
        <Text style={styles.saveButtonText}>
          Save Privacy Settings
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Privacy changes will only take effect once account
        settings are connected to the KONNEKT backend.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    color: '#075E54',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 25,
    color: '#17202A',
  },
  heading: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#17202A',
    marginHorizontal: 18,
    marginTop: 25,
  },
  description: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
    margin: 18,
  },
  option: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    paddingRight: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#17202A',
  },
  optionDescription: {
    fontSize: 12,
    color: '#667085',
    marginTop: 5,
    lineHeight: 17,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#075E54',
  },
  contactsSection: {
    margin: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  contactsHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#17202A',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  contactName: {
    fontSize: 14,
    color: '#17202A',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#075E54',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#075E54',
    margin: 18,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footer: {
    color: '#667085',
    fontSize: 11,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 25,
    lineHeight: 17,
  },
});
