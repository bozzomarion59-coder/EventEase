import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Layout des onglets principaux de l'application (Événements et Profil)
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Événements',
          tabBarAccessibilityLabel: 'Liste des événements',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mon profil',
          tabBarAccessibilityLabel: 'Mon profil et connexion',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
