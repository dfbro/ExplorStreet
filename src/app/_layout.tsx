import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { RoutePreferencesProvider } from '@/features/routes/preferences';
import { DemoProvider } from '@/features/demo/demo-store';
import {PresetStoreProvider} from '@/features/map/preset-store';
import {MapSelectionProvider} from '@/features/map/map-selection';
import { font, palette } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsReady, fontsError] = useFonts({
    ...MaterialIcons.font,
    [font.body]: DMSans_400Regular,
    [font.medium]: DMSans_500Medium,
    [font.semi]: DMSans_600SemiBold,
    [font.bold]: DMSans_700Bold,
    [font.display]: Outfit_700Bold,
    [font.extra]: Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (fontsReady || fontsError) void SplashScreen.hideAsync();
  }, [fontsReady, fontsError]);

  if (!fontsReady && !fontsError) return null;

  return (
    <RoutePreferencesProvider>
      <PresetStoreProvider>
      <MapSelectionProvider>
      <DemoProvider>
      <StatusBar style="dark"/>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerTintColor: palette.forest,
        headerTitleStyle: { fontFamily: font.display, fontSize: 17 },
        contentStyle: { backgroundColor: palette.background },
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }}/>
        <Stack.Screen name="nav" options={{ headerShown: false }}/>
        <Stack.Screen name="buddy" options={{ headerShown: false }}/>
        <Stack.Screen name="stops" options={{ headerShown: false }}/>
        <Stack.Screen name="feed" options={{ headerShown: false }}/>
        <Stack.Screen name="partner" options={{ headerShown: false }}/>
        <Stack.Screen name="admin" options={{ headerShown: false }}/>
        <Stack.Screen name="routes/[id]" options={{ title: 'Detail rute', headerBackTitle: 'Kembali' }}/>
      </Stack>
      </DemoProvider>
      </MapSelectionProvider>
      </PresetStoreProvider>
    </RoutePreferencesProvider>
  );
}
