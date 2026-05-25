import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getApiUrl } from '@/utils/getIpHelper';

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('userData').then(data => {
      if(data) setUserId(JSON.parse(data).id);
    });
  }, []);

  const handleChange = async () => {
    if (!oldPassword || !newPassword) return Alert.alert("Error", "Semua kolom wajib diisi");
    
    try {
      await axios.post(`${getApiUrl()}/change-password`, {
        userId, oldPassword, newPassword
      });
      Alert.alert("Sukses", "Password berhasil diganti", [{ text: "OK", onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert("Gagal", error.response?.data?.message || "Password lama salah");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Stack.Screen options={{ 
        title: "Ganti Password",
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
        )
      }} />
      
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Password Lama</Text>
          <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} secureTextEntry placeholder="******" />
          
          <Text style={styles.label}>Password Baru</Text>
          <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="******" />
          
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFA000' }]} onPress={handleChange}>
            <Text style={styles.btnText}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Gunakan style yang mirip dengan Edit Profile
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 3 },
  label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 10, marginBottom: 20, backgroundColor: '#FAFAFA' },
  btn: { padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});