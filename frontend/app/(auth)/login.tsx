import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

interface ApiConfig {
    url: string;
    key: string;
};

export default function LoginScreen() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const router = useRouter();
  
  const config = Constants.expoConfig?.extra?.api as ApiConfig;
  const apiUrl = config?.url;
  const apiKey = config?.key;
  const API_URL = apiUrl + '/' + apiKey;

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Peringatan", "Username dan Password tidak boleh kosong!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username: username,
        password: password
      });

      // Jika login berhasil (Status 200)
      if (response.data.token) {
        // Simpan Token dan Data User
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Pindah ke halaman utama (tabs)
        router.replace('/(tabs)' as any);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal terhubung ke server";
      Alert.alert("Login Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>CleanSchool</Text>
        <Text style={styles.subtitle}>Selamat Datang Kembali!</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput 
            style={styles.input}
            placeholder="Masukkan username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input}
            placeholder="Masukkan password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>MASUK</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(auth)/register' as any)}
          style={styles.registerLink}
        >
          <Text style={styles.linkText}>
            Belum punya akun? <Text style={styles.linkHighlight}>Daftar Sekarang</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', padding: 30, borderRadius: 20, elevation: 5 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    padding: 15, 
    borderRadius: 12, 
    backgroundColor: '#FAFAFA',
    fontSize: 16
  },
  button: { 
    backgroundColor: '#2E7D32', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  registerLink: { marginTop: 25 },
  linkText: { textAlign: 'center', color: '#666', fontSize: 14 },
  linkHighlight: { color: '#2E7D32', fontWeight: 'bold' }
});