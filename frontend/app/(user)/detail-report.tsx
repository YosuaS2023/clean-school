import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DetailReportScreen({ route }: any) {
  // Ambil data yang dikirim dari Dashboard
  const { item, apiUrl } = route.params;
  const fotoArray = item.foto_url ? item.foto_url.split(',') : [];

  return (
    <ScrollView style={styles.container}>
      {/* Slider Gambar Besar */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {fotoArray.map((foto: string, index: number) => (
          <Image 
            key={index}
            source={{ uri: `${apiUrl}/uploads/${foto}` }}
            style={styles.fullImage}
          />
        ))}
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="location" size={24} color="#2E7D32" />
          <Text style={styles.locationTitle}>{item.lokasi}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: item.status === 'Selesai' ? '#E8F5E9' : '#FFF3E0' }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>

        <Text style={styles.label}>Deskripsi Kejadian:</Text>
        <Text style={styles.description}>{item.deskripsi}</Text>
        
        <Text style={styles.label}>Waktu Laporan:</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleString('id-ID')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  fullImage: { width: width, height: 300, resizeMode: 'cover' },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  locationTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 8, color: '#333' },
  badge: { alignSelf: 'flex-start', padding: 6, borderRadius: 6, marginBottom: 20 },
  badgeText: { fontWeight: 'bold' },
  label: { fontSize: 14, color: '#999', marginBottom: 5, marginTop: 15 },
  description: { fontSize: 16, color: '#444', lineHeight: 24 },
  date: { fontSize: 14, color: '#666' }
});