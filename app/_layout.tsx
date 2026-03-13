import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth.store';
import { router } from 'expo-router';

export default function RootLayout() {
  const { isAuthenticated, restoreSession, isLoading } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="destination/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="hotel/index" options={{ headerShown: false }} />
        <Stack.Screen name="hotel/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="hotel/booking" options={{ headerShown: false }} />
        <Stack.Screen name="hotel/confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="transport/index" options={{ headerShown: false }} />
        <Stack.Screen name="transport/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="transport/booking" options={{ headerShown: false }} />
        <Stack.Screen name="transport/confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="flights/index" options={{ headerShown: false }} />
        <Stack.Screen name="flights/results" options={{ headerShown: false }} />
        <Stack.Screen name="ai-planner/index" options={{ headerShown: false }} />
        <Stack.Screen name="ai-planner/results" options={{ headerShown: false }} />
        <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
