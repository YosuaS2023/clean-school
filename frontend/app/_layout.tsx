import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('userToken');
      setIsLogin(!!user); 
    } catch (e) {
      console.error("Gagal ambil token", e);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!isReady) return;

      const token = await AsyncStorage.getItem('userToken');
      const isActuallyLoggedIn = !!token; // Cek langsung dari storage
      const inAuthGroup = segments[0] === '(auth)';

      if (!isActuallyLoggedIn && !inAuthGroup) {
        // Belum login & tidak di folder auth
        router.replace('/(auth)/login');
      } else if (isActuallyLoggedIn && inAuthGroup) {
        // Sudah login tapi masih di halaman login/register
        router.replace('/(tabs)');
      }
    };

    checkAuthStatus();
  }, [isReady, segments]); // Pantau perubahan 'segments' (perpindahan halaman)

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* CUKUP INI SAJA. 
        Expo Router akan otomatis mencari rute di dalam grup (auth) dan (tabs).
        Jangan masukkan <Stack.Screen name="(auth)" /> karena itu yang bikin error.
      */}
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}