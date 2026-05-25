import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router'; // Tambahkan Stack
import { Ionicons } from '@expo/vector-icons';
import { getApiUrl } from '@/utils/getIpHelper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function EditProfileScreen() {
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem('userData');
    if (data) {
      const user = JSON.parse(data);
      setNama(user.nama_lengkap);
      setUsername(user.username);
      setUserId(user.id);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.post(`${getApiUrl()}/update-profile`, {
        userId,
        nama_lengkap: nama,
        username: username
      });
      
      if (response.status === 200) {
        // Update storage agar di halaman Setting namanya langsung berubah
        const data = await AsyncStorage.getItem('userData');
        const user = JSON.parse(data || '{}');
        const updatedUser = { ...user, nama_lengkap: nama, username: username };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        
        Alert.alert("Berhasil", "Profil diperbarui!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      Alert.alert("Gagal", error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Stack.Screen options={{ 
        title: "Ubah Nama & User",
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
        )
      }} />

      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput style={styles.input} value={nama} onChangeText={setNama} placeholder="Masukkan nama..." />
          
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Masukkan username..." autoCapitalize="none" />
          
          <TouchableOpacity style={styles.btn} onPress={handleUpdateProfile}>
            <Text style={styles.btnText}>Simpan Perubahan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 3 },
  label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 10, marginBottom: 20, backgroundColor: '#FAFAFA' },
  btn: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});