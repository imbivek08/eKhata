import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { initDatabase } from '@/database';
import { I18nProvider } from '@/hooks/use-i18n';

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setError('Failed to initialize database. Please restart the app.');
      }
    };

    setupDatabase();
  }, []);

  if (error) {
    return (
      <View style={styles.loading}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!dbInitialized) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingIcon}>📒</Text>
        <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Loading eKhata...</Text>
      </View>
    );
  }

  return (
    <I18nProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="customer/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="archived" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90D9',
  },
  loadingIcon: {
    fontSize: 64,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 14,
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: '#E11D48',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});
