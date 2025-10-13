import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TemplateEditorScreenPlaceholder = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Template Editor Screen</Text>
    <Text style={styles.subtitle}>Feature coming soon...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  }
});
