import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';
import { getApiUrl } from '@/utils/getIpHelper';

const { width } = Dimensions.get('window');

interface ApiConfig {
  url: string;
  key: string;
}

export default function ReportDetailScreen() {
  const { report } = useLocalSearchParams();

  const item = JSON.parse(report as string);
  const config = Constants.expoConfig?.extra?.api as ApiConfig;
  const apiUrl = config.url;
  const apiKey = config.key;
  
  const fotoArray = item.foto_url
  ? item.foto_url.split(',')
  : [];
  
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const user = await AsyncStorage.getItem('userData');

      if (user) {
        const parsed = JSON.parse(user);
        setRole(parsed.role);
      }
    };

    getUser();
  }, []);
  const updateStatus = async (status: string) => {
    try {
        console.log(`${getApiUrl()}/report/check/${item.id}`)
        await axios.put(`${getApiUrl()}/report/check/${item.id}`, {
        status,
        });

        Alert.alert('Sukses', 'Status berhasil diupdate');
        
        router.back();

    } catch (error) {
        Alert.alert('Error', 'Gagal update status');
    }
  };

  console.log(role)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
        >
            <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
            Detail Laporan
        </Text>
      </View>

      {/* gallery */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {fotoArray.map((foto: string, index: number) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              source={{ uri: `${apiUrl}/uploads/${foto}` }}
              style={styles.image}
            />

            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {index + 1}/{fotoArray.length}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.content}>
        <Text style={styles.title}>
          {item.lokasi}
        </Text>

        <Text style={styles.label}>Deskripsi</Text>
        <Text style={styles.text}>
          {item.deskripsi}
        </Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>
          {item.status}
        </Text>

        <Text style={styles.label}>Tanggal</Text>
        <Text style={styles.text}>
          {item.created_at}
        </Text>
        {(role === 'admin' || role === 'petugas') && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>

            <TouchableOpacity
              style={[styles.statusBtn, { backgroundColor: '#FFC107' }]}
              onPress={() => updateStatus('Pending')}
            >
              <Text style={styles.statusBtnText}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, { backgroundColor: '#2196F3' }]}
              onPress={() => updateStatus('Proses')}
            >
              <Text style={styles.statusBtnText}>Proses</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, { backgroundColor: '#4CAF50' }]}
              onPress={() => updateStatus('Selesai')}
            >
              <Text style={styles.statusBtnText}>Selesai</Text>
            </TouchableOpacity>

          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  imageWrapper: {
    width: width,
    height: 300,
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  counter: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  counterText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
  },

  label: {
    fontSize: 14,
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },

  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },

  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF6C00',
  },

  header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 15,
  paddingTop: 50,
  paddingBottom: 15,
  backgroundColor: '#fff',
  },

  backButton: {
  marginRight: 15,
  },

  headerTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
  },

statusBtn: {
  paddingHorizontal: 15,
  paddingVertical: 10,
  borderRadius: 8,
},

statusBtnText: {
  color: '#fff',
  fontWeight: 'bold',
},
});