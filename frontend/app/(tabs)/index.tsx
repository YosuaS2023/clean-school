import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Modal,
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

import axios from 'axios';
import Constants from 'expo-constants';

interface Report {
  id: number;
  lokasi: string;
  deskripsi: string;
  foto_url: string;
  status: string;
  created_at: string;
}

interface ApiConfig {
    url: string;
    key: string;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  // cardImage: { width: '100%', height: 150 },
  cardBody: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  locationText: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginLeft: 5 },
  descText: { fontSize: 14, color: '#666', marginBottom: 10 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },

  imageScroll: {
    height: 200, // Sesuaikan tinggi gambar
  },
  imageWrapper: {
    width: width - 32, // Lebar layar dikurangi padding container
    height: 200,
    position: 'relative',
  },
  cardImage: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover' 
  },
  imageTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  imageTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  }
});

export default function DashboardScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Ambil URL dari .env
  const config = Constants.expoConfig?.extra?.api as ApiConfig;
  const apiUrl = config?.url;
  const apiKey = config?.key;

  const openPreview = (images: string[], index: number) => {
    setSelectedImages(images);
    setSelectedIndex(index);
    setPreviewVisible(true);
  };
  const fetchReports = async () => {
    try {
      const response = await axios.get(`${apiUrl}/${apiKey}/reports`);
      setReports(response.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const renderItem = ({ item }: { item: Report }) => {
    // Pecah string foto_url menjadi array
    const fotoArray = item.foto_url ? item.foto_url.split(',') : [];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: '/report-detail',
            params: {
              report: JSON.stringify(item),
            },
          })
        }
      >
        {/* Container untuk banyak gambar */}
        {fotoArray.length > 0 && (
          <ScrollView 
            horizontal 
            pagingEnabled // Membuat swipe terasa pas per gambar
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {fotoArray.map((foto, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image 
                  source={{ uri: `${apiUrl}/uploads/${foto}` }}
                  style={styles.cardImage} 
                />
                {/* Indikator angka foto (misal: 1/3) */}
                <View style={styles.imageTag}>
                  <Text style={styles.imageTagText}>{index + 1}/{fotoArray.length}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Ionicons name="location" size={16} color="#2E7D32" />
            <Text style={styles.locationText}>{item.lokasi}</Text>
          </View>
          <Text style={styles.descText}>{item.deskripsi}</Text>
          <View style={[styles.badge, { backgroundColor: item.status === 'Selesai' ? '#E8F5E9' : '#FFF3E0' }]}>
            <Text style={[styles.badgeText, { color: item.status === 'Selesai' ? '#2E7D32' : '#EF6C00' }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Riwayat Laporan</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Belum ada laporan kebersihan.</Text>
        }
      />
    </View>
  );
}