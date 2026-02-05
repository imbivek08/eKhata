import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { initDatabase } from '@/database';

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    setupDatabase();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
