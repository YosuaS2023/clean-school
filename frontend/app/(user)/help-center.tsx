import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpCenterScreen() {
  const router = useRouter();

  const emailto = "stevenyosua28@gmail.com";
  const openWhatsApp = () => {
    const phoneNumber = '6282323619266'; // Ganti dengan nomor Admin sekolah
    const message = 'Halo Admin, saya petugas kebersihan aplikasi ingin bertanya...';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Pastikan WhatsApp terinstall di HP Anda");
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Stack.Screen options={{ 
        title: "Pusat Bantuan",
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
        )
      }} />

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Ada masalah apa?</Text>
        <Text style={styles.subtitle}>Kamu dapat menghubungi kontak whatsapp atau email untuk menyelesaikan masalah yang anda dapat.</Text>

        {/* FAQ Section */}
        <View style={styles.section}>
          <FAQItem 
            question="Lupa password akun?" 
            answer="Silakan hubungi Admin melalui kontak whatsapp untuk menganti password." 
          />
        </View>

        {/* Contact Section */}
        <Text style={styles.sectionLabel}>Kontak Admin</Text>
        <TouchableOpacity style={styles.contactCard} onPress={openWhatsApp}>
          <View style={styles.iconCircle}>
            <Ionicons name="logo-whatsapp" size={30} color="#FFF" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>WhatsApp</Text>
            <Text style={styles.contactSub}>Chat untuk respon cepat jika aktif</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.contactCard, { marginTop: 15 }]} 
            onPress={() => Linking.openURL(`mailto:${emailto}`)}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#4285F4' }]}>
            <Ionicons name="mail-outline" size={30} color="#FFF" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactSub}>Keluhan melalui email</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <Text style={styles.version}>Aplikasi Clean School</Text>
      </ScrollView>
    </View>
  );
}

// Komponen Kecil FAQ
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <TouchableOpacity style={styles.faqBox} onPress={() => setIsOpen(!isOpen)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#666" />
      </View>
      {isOpen && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 25 },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  faqBox: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: '#444', flex: 1 },
  faqAnswer: { fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 15, elevation: 3 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1, marginLeft: 15 },
  contactTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  contactSub: { fontSize: 12, color: '#888' },
  version: { textAlign: 'center', marginTop: 40, color: '#BBB', fontSize: 12, marginBottom: 20 }
});