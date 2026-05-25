import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';

interface ApiConfig {
    url: string;
    key: string;
};

export default function RegisterScreen() {
  const [nama, setNama] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const router = useRouter();
  
  const config = Constants.expoConfig?.extra?.api as ApiConfig;
  const apiUrl = config?.url;
  const apiKey = config?.key;
  const API_URL = apiUrl + '/' + apiKey;

  const handleRegister = async () => {
    // Validasi dasar ala anak RPL
    if (!nama || !username || !password) {
      Alert.alert("Error", "Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, {
        nama_lengkap: nama,
        username: username,
        password: password
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Berhasil", "Akun berhasil dibuat. Silakan login.");
        router.replace('/(auth)/login' as any);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Gagal daftar, coba lagi nanti.";
      Alert.alert("Pendaftaran Gagal", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Daftar Akun</Text>
          <Text style={styles.subtitle}>Buat akun untuk mulai melapor</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput 
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              value={nama}
              onChangeText={setNama}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput 
              style={styles.input}
              placeholder="Buat username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input}
              placeholder="Minimal 6 karakter"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'PROSES...' : 'DAFTAR SEKARANG'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.linkText}>Sudah punya akun? <Text style={{fontWeight: 'bold'}}>Login di sini</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 3 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { 
    borderWidth: 1, 
    borderColor: '#DDD', 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: '#FAFAFA',
    fontSize: 16
  },
  button: { 
    backgroundColor: '#2E7D32', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 15 
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { textAlign: 'center', marginTop: 20, color: '#2E7D32', fontSize: 14 }
});