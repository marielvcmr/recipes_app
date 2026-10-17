import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_600SemiBold_Italic,
  useFonts,
} from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BlurTargetProvider } from '@/context/BlurTargetContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_600SemiBold_Italic,
    DMSans_400Regular,
    DMSans_700Bold,
  });

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <BlurTargetProvider>
        <RootNavigator />
      </BlurTargetProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();

  // El splash se queda hasta saber si había una sesión guardada
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  // Con sesión solo se puede entrar a la app; sin sesión, solo a login y registro
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
