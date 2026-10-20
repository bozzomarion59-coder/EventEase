import { HeaderTitle } from '@/components/HeaderTitle';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Layout racine de l'application : le thème et la session enveloppent toute la navigation
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedStack />
      </AuthProvider>
    </ThemeProvider>
  );
}

// La pile de navigation, aux couleurs du thème actif
function ThemedStack() {
  const { colors, mode } = useTheme();

  return (
    <>
      {/* Heure et batterie en clair sur fond sombre, et inversement */}
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      {/* Flèche retour seule, sans le nom de l'écran précédent (sinon « (tabs) » s'affiche) */}
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerTitle: (props) => <HeaderTitle>{props.children}</HeaderTitle>,
        }}
      >
        {/* Les onglets principaux (sans en-tête global) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Les autres écrans de l'application */}
        <Stack.Screen name="auth/login" options={{ title: 'Connexion' }} />
        <Stack.Screen name="auth/register" options={{ title: 'Inscription' }} />
        <Stack.Screen name="event/form" options={{ title: 'Événement' }} />
        <Stack.Screen name="event/[id]" options={{ title: 'Détail' }} />
      </Stack>
    </>
  );
}
