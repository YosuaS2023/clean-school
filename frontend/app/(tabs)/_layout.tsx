import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#2E7D32', 
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Daftar Laporan', 
          tabBarIcon: ({color}) => <Ionicons name="list" size={24} color={color}/> 
        }} 
      />
      <Tabs.Screen 
        name="report" 
        options={{ 
          title: 'Buat Laporan', 
          tabBarIcon: ({color}) => <Ionicons name="camera" size={24} color={color}/> 
        }} 
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}