import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Constants from 'expo-constants';

interface ApiConfig {
    url: string;
    key: string;
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  box: { height: 200, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginBottom: 15 },
  img: { width: '100%', height: '100%', borderRadius: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15 },
  btn: { backgroundColor: '#24e124', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },

});

export default function ReportScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Error', 'Butuh akses kamera');

    let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
    
    if (!result.canceled) {
      // Tambahkan uri baru ke dalam array
      setImages([...images, result.assets[0].uri]);
    }
  };
  const removePhoto = (uriToRemove: string) => {
    setImages(images.filter((uri) => uri !== uriToRemove));
  };
  const submit = async () => {
    if (images.length === 0 || !lokasi) {
      return Alert.alert('Error', 'Foto & Lokasi wajib!');
    }

    const formData = new FormData();
    formData.append('lokasi', lokasi);
    formData.append('deskripsi', deskripsi);

    // Perulangan untuk memasukkan banyak file
    images.forEach((uri, index) => {
      // Pastikan URI tidak kosong
      if (!uri) return;

      const filename = uri.split('/').pop() || `photo_${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // STRUKTUR WAJIB: uri, name, type
      // @ts-ignore (untuk menghindari komplain tipe data FormData)
      formData.append('images', {
        uri: uri, // Di Android/iOS tertentu, terkadang butuh: Platform.OS === 'android' ? uri : uri.replace('file://', '')
        name: filename,
        type: type,
      });
    });

    try {
      const config = Constants.expoConfig?.extra?.api as ApiConfig;
      
      await axios.post(`${config.url}/${config.key}/reports`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
        // Penting: Tambahkan timeout jika upload banyak gambar
        timeout: 30000, 
      });
      
      Alert.alert('Sukses', 'Laporan terkirim!');
      setImages([]); 
      setLokasi('');
      setDeskripsi('');
    } catch (e: any) {
      console.log('Detail Error:', e.response?.data || e.message);
      Alert.alert('Gagal', 'Gagal mengirim laporan. Cek koneksi atau ukuran file.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal style={{ flexDirection: 'row', marginBottom: 15 }} showsHorizontalScrollIndicator={false}>
        
        {/* 1. Loop Gambar: Tombol Hapus harus ada DI DALAM sini */}
        {images.map((uri, index) => (
          <View key={index} style={{ marginRight: 15, position: 'relative' }}>
            <Image 
              source={{ uri }} 
              style={{ width: 100, height: 100, borderRadius: 10 }} 
            />
            
            {/* Tombol Hapus diletakkan menempel pada gambar */}
            <TouchableOpacity 
              // style={styles} 
              onPress={() => removePhoto(uri)} // Sekarang 'uri' terbaca karena di dalam map
            >
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}

        {/* 2. Tombol Tambah Foto: Hanya muncul jika foto kurang dari 5 */}
        {images.length < 5 && (
          <TouchableOpacity 
            style={[styles.box, { width: 100, height: 100, marginBottom: 0, borderStyle: 'dashed', borderWidth: 1 }]} 
            onPress={takePhoto}
          >
            <Ionicons name="camera" size={30} color="#ccc" />
            <Text style={{ fontSize: 10, color: '#ccc' }}>Tambah</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <TextInput 
        placeholder="Lokasi (Lobby/Kantin)" 
        style={styles.input} 
        value={lokasi} 
        onChangeText={setLokasi} 
      />
      <TextInput 
        placeholder="Keterangan" 
        style={[styles.input, {height: 80}]} 
        multiline 
        value={deskripsi} 
        onChangeText={setDeskripsi} 
      />
      
      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>Kirim</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
