import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter, useFocusEffect} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getProfilePictureUrl, getBaseUrl } from '../../utils/imageUrlHelper';
import { getApiUrl } from '../../utils/getIpHelper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';


interface UserData {
  id: number;
  nama_lengkap: string;
  username: string;
  role: string;
  foto_profil?: string | null;
}

export default function SettingsScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [imgUri, setImgUri] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const pickImage = async () => {
    // Minta izin akses galeri
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Izin Ditolak", "Aplikasi butuh izin untuk mengakses galeri.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Foto profil kotak
      quality: 0.5,   // Kompres agar tidak terlalu berat
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    
    // Sesuai kebutuhan Multer (harus berupa objek file)
    const localUri = uri;
    const filename = localUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('foto', { uri: localUri, name: filename, type } as any);
    formData.append('userId', user?.id.toString() || '');

    try {
      const response = await axios.post(`${getApiUrl()}/update-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.foto_profil) {
        // Update state gambar lokal agar langsung berubah
        const newFoto = response.data.foto_profil;
        setImgUri(`${getBaseUrl()}/uploads/profile/${newFoto}`);
        
        // Update AsyncStorage agar saat refresh data tetap yang baru
        const newData = { ...user, foto_profil: newFoto };
        await AsyncStorage.setItem('userData', JSON.stringify(newData));
        setUser(newData as UserData);
        
        Alert.alert("Berhasil", "Foto profil telah diperbarui!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal mengunggah gambar ke server.");
    }
  };

    // 1. Pastikan fungsi loadUserData bisa diakses
  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedUser = JSON.parse(data);
        setUser(parsedUser);
        // Update juga foto profilnya supaya sinkron
        setImgUri(getProfilePictureUrl(parsedUser.foto_profil, parsedUser.username));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Gunakan useFocusEffect sebagai pengganti useEffect
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const handleProfilePress = () => {
    Alert.alert(
      "Foto Profil",
      "Pilih tindakan untuk foto profil Anda",
      [
        { text: "Ganti Foto (Galeri)", onPress: pickImage },
        { text: "Gunakan Foto Resmi (Server)", onPress: useDefaultPhoto },
        { text: "Hapus Foto", style: "destructive", onPress: removePhoto },
        { text: "Batal", style: "cancel" },
      ]
    );
  };

  // --- FUNGSI 1: GUNAKAN FOTO RESMI (SERVER) ---
  const useDefaultPhoto = async () => {
    try {
      // Kita set foto_profil di DB jadi NULL
      // Helper getProfilePictureUrl otomatis akan mencari username.jpg
      const response = await axios.post(`${getApiUrl()}/reset-photo`, {
        userId: user?.id,
        action: 'default'
      });

      if (response.status === 200) {
        updateLocalData(null);
        Alert.alert("Berhasil", "Sekarang menggunakan foto resmi sekolah.");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal mereset foto.");
    }
  };

  // --- FUNGSI 2: HAPUS FOTO (ICON SAJA) ---
  const removePhoto = async () => {
    try {
      // Kita set foto_profil di DB jadi 'deleted' atau string khusus
      const response = await axios.post(`${getApiUrl()}/reset-photo`, {
        userId: user?.id,
        action: 'remove'
      });

      if (response.status === 200) {
        updateLocalData('deleted'); 
        Alert.alert("Berhasil", "Foto profil dihapus.");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal menghapus foto.");
    }
  };

  // Fungsi pembantu untuk update state dan storage
  const updateLocalData = async (newVal: string | null) => {
    const newData = { ...user, foto_profil: newVal };
    await AsyncStorage.setItem('userData', JSON.stringify(newData));
    setUser(newData as UserData);
    setImgUri(getProfilePictureUrl(newVal, user?.username));
  };
  const handleImageError = () => {
    const defaultUrl = `${getBaseUrl()}/uploads/profile/defaults/profil_default.jpg`;
    
    // Jika uri saat ini bukan default, maka arahkan ke default
    // Ini mencegah infinite loop jika file default-pun tidak ada
    if (imgUri !== defaultUrl) {
      console.log("Gambar tidak ditemukan, beralih ke default...");
      setImgUri(defaultUrl);
    }
  };

  const handleLogout = () => {
    Alert.alert("Konfirmasi", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Keluar", 
        onPress: async () => {
          await AsyncStorage.multiRemove(['userToken', 'userData']);
          router.replace('/(auth)/login' as any);
        } 
      }
    ]);
  };

  if (loading) return <ActivityIndicator style={{flex: 1}} />;

  return (
    <ScrollView style={styles.container}>
      {/* Profil Header */}
      <View style={styles.header}>
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: imgUri }} 
            style={styles.profileImg}
            onError={handleImageError} // <--- Kuncinya di sini
          />
          <TouchableOpacity style={styles.camBtn} onPress={handleProfilePress}>
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.name}>{user?.nama_lengkap}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Menu List */}
      <View style={styles.section}>
      {/* Tombol Edit Profil */}
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
          <Ionicons name="person-outline" size={22} color="#333" />
          <Text style={styles.menuLabel}>Edit Profil</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>

        {/* Tombol Ganti Password */}
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/change-password')}>
          <Ionicons name="lock-closed-outline" size={22} color="#333" />
          <Text style={styles.menuLabel}>Ganti Password</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/help-center')}
        >
          <Ionicons name="help-circle-outline" size={22} color="#333" />
          <Text style={styles.menuLabel}>Pusat Bantuan</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ff4444" />
          <Text style={styles.logoutTxt}>Keluar Akun</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Komponen Kecil untuk Menu
const MenuButton = ({ icon, label }: { icon: any, label: string }) => (
  <TouchableOpacity style={styles.menuItem}>
    <Ionicons name={icon} size={22} color="#333" />
    <Text style={styles.menuLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#ccc" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: 30, borderBottomWidth: 1, borderBottomColor: '#eee' },
  imageWrapper: { position: 'relative', marginBottom: 15 },
  profileImg: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#ddd', borderWidth: 3, borderColor: '#2E7D32' },
  camBtn: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#2E7D32', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  username: { fontSize: 14, color: '#777', marginBottom: 10 },
  badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#2E7D32', fontSize: 11, fontWeight: 'bold' },
  section: { backgroundColor: '#fff', marginTop: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  menuLabel: { flex: 1, marginLeft: 15, fontSize: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  logoutTxt: { marginLeft: 15, fontSize: 16, color: '#ff4444', fontWeight: '500' }
});