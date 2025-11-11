import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { seedWorkoutsForEmail, seedWorkoutsForUserId } from '../../shared/services/dev/seedDemoData';
import { useCloudflareAuth } from '../../shared/contexts/CloudflareAuthContext';

export const SettingsScreenPlaceholder = () => {
  const { theme } = useTheme();
  const { user } = useCloudflareAuth();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>
      <Text style={styles.subtitle}>功能開發中...</Text>
      <Text style={styles.description}>
        This screen will contain app settings, preferences, and configuration options.
      </Text>
      {__DEV__ && (
        <TouchableOpacity
          style={styles.devButton}
          onPress={async () => {
            const email = 'abc@gmail.com';
            const results: string[] = [];
            const r1 = await seedWorkoutsForEmail(email);
            results.push(r1.success ? `email:${email}=ok` : `email:${email}=fail`);
            if (user?.id) {
              const r2 = await seedWorkoutsForUserId(user.id);
              results.push(r2.success ? `userId:${user.id}=ok` : `userId:${user.id}=fail`);
            }
            Alert.alert('Dev', `Seeding done: ${results.join(', ')}`);
          }}
        >
          <Text style={styles.devButtonText}>Seed Demo Workouts (abc@gmail.com)</Text>
        </TouchableOpacity>
      )}
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
  devButton: {
    marginTop: 30,
    backgroundColor: theme.primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  devButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});


