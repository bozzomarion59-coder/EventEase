import { Stack } from 'expo-router';

// Layout racine de l'application (gestion de la navigation entre les écrans)
export default function RootLayout() {
  return (
    // Flèche retour seule, sans le nom de l'écran précédent (sinon « (tabs) » s'affiche)
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      {/* Les onglets principaux (sans en-tête global) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Les autres écrans de l'application */}
      <Stack.Screen name="auth/login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="auth/register" options={{ title: 'Inscription' }} />
      <Stack.Screen name="event/form" options={{ title: 'Événement' }} />
      <Stack.Screen name="event/[id]" options={{ title: 'Détail' }} />
    </Stack>
  );
}

