import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import AppNavigator from '@/navigation';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    // On boot, load any API base URL override from AsyncStorage
    import('@/lib/storage')
      .then(async (storage) => {
        const url = await storage.getApiBaseUrl();
        if (url) {
          const api = await import('@/lib/api');
          api.setBaseUrlOverride(url);
        }
      })
      .catch(() => {});
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFD900', fontSize: 18, fontWeight: '700' }}>Airway MD</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}