import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#111' },
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#666666'
    }}>
      <Tabs.Screen name="index" options={{ 
        href: null,
      }} />
      <Tabs.Screen name="reports" options={{ 
        title: 'Reports',
        tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />
      }} />
      <Tabs.Screen name="dashboard" options={{ 
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />
      }} />
      <Tabs.Screen name="chat" options={{ 
        title: 'AI Chat',
        tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />
      }} />
    </Tabs>
  );
}
