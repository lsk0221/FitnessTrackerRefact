import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';

export const SettingsScreenPlaceholder = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>
      <Text style={styles.subtitle}>功能開發中...</Text>
      <Text style={styles.description}>
        This screen will contain app settings, preferences, and configuration options.
      </Text>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.backgroundColor,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});


