import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProgressProvider } from '../lib/progress';

export default function RootLayout() {
  return (
    <ProgressProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: '#1F2A44',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F5F7FB' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'TYT Soru Video' }} />
        <Stack.Screen name="subject/[id]" options={{ title: 'Sorular' }} />
        <Stack.Screen name="question/[id]" options={{ title: 'Soru' }} />
        <Stack.Screen name="favorites" options={{ title: 'Favoriler' }} />
      </Stack>
    </ProgressProvider>
  );
}
