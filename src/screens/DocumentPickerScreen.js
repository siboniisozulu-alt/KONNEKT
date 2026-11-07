
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

const sampleDocuments = [
  {
    id: '1',
    name: 'Business Proposal.pdf',
    type: 'PDF',
    size: '2.4 MB',
    icon: '📕',
    category: 'PDF',
  },
  {
    id: '2',
    name: 'Project Notes.docx',
    type: 'WORD',
    size: '850 KB',
    icon: '📘',
    category: 'Word',
  },
  {
    id: '3',
    name: 'Monthly Budget.xlsx',
    type: 'EXCEL',
    size: '1.2 MB',
    icon: '📗',
    category: 'Excel',
  },
  {
    id: '4',
    name: 'Presentation.pptx',
    type: 'POWERPOINT',
    size: '3.1 MB',
    icon: '📙',
    category: 'Other',
  },
  {
    id: '5',
    name: 'Meeting Details.pdf',
    type: 'PDF',
    size: '500 KB',
    icon: '📕',
    category: 'PDF',
  },
];

export default function DocumentPickerScreen({
  navigation,
  route,
}) {
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
  };

  const [search, setSearch] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [category, setCategory] = useState('All');

  const categories = ['All', 'PDF', 'Word', 'Excel', 'Other'];

  const filteredDocuments = sampleDocuments.filter((document) => {
    const matchesSearch = document.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === 'All' || document.category === category;

    return matchesSearch && matchesCategory;
  });

  const sendDocument = () => {
    if (!selectedDocument) {
      Alert.alert('Select a document', 'Choose a document first.');
      return;
    }

    Alert.alert(
      'Demo selection',
      `${selectedDocument.name} selected for ${contact.name}. Real document sharing will be connected later.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Share document</Text>
          <Text style={styles.headerSubtitle}>
            To {contact.name}
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              category === item && styles.activeCategory,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && styles.activeCategoryText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>
        AVAILABLE DOCUMENTS
      </Text>

      <ScrollView contentContainerStyle={styles.documentList}>
        {filteredDocuments.length === 0 ? (
          <Text style={styles.emptyText}>
            No matching documents found.
          </Text>
        ) : (
          filteredDocuments.map((document) => {
            const selected = selectedDocument?.id === document.id;

            return (
              <TouchableOpacity
                key={document.id}
                style={[
                  styles.documentCard,
                  selected && styles.selectedCard,
                ]}
                onPress={() => setSelectedDocument(document)}
              >
                <Text style={styles.documentIcon}>
                  {document.icon}
                </Text>

                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {document.name}
                  </Text>
                  <Text style={styles.documentDetails}>
                    {document.type} • {document.size}
                  </Text>
                </View>

                <Text style={styles.selection}>
                  {selected ? '✓' : '○'}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.selectionInfo}>
          {selectedDocument
            ? selectedDocument.name
            : 'No document selected'}
        </Text>

        <TouchableOpacity
          style={[
            styles.sendButton,
            !selectedDocument && styles.disabledButton,
          ]}
          onPress={sendDocument}
        >
          <Text style={styles.sendButtonText}>
            Send document →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
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
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D5EAE7',
    fontSize: 11,
    marginTop: 3,
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#17202A',
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  categoryScroll: {
    maxHeight: 48,
    paddingHorizontal: 10,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    alignSelf: 'flex-start',
  },
  activeCategory: {
    backgroundColor: '#075E54',
  },
  categoryText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 'bold',
    marginHorizontal: 17,
    marginTop: 20,
    marginBottom: 10,
  },
  documentList: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  selectedCard: {
    borderColor: '#075E54',
    backgroundColor: '#EAF5F1',
  },
  documentIcon: {
    fontSize: 30,
    marginRight: 13,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    color: '#17202A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  documentDetails: {
    color: '#667085',
    fontSize: 11,
    marginTop: 5,
  },
  selection: {
    color: '#075E54',
    fontSize: 22,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#667085',
    textAlign: 'center',
    marginTop: 35,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  selectionInfo: {
    color: '#667085',
    fontSize: 11,
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#075E54',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
