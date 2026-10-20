import { HeaderBackground } from '@/components/HeaderBackground';
import { HeaderTitle } from '@/components/HeaderTitle';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

// Le splash screen reste affiché tant que les polices ne sont pas chargées
SplashScreen.preventAutoHideAsync();

// Layout racine de l'application : les polices, le thème et la session enveloppent toute la navigation
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Fredoka_600SemiBold, Nunito_400Regular, Nunito_700Bold });

  // Polices prêtes (ou en erreur : l'app s'affiche alors avec la police du système)
  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
  const { colors } = useTheme();

  return (
    <>
      {/* L'en-tête est toujours foncé (dégradé bleu nuit) : heure et batterie en clair dans les deux thèmes */}
      <StatusBar style="light" />

      {/* Flèche retour seule, sans le nom de l'écran précédent (sinon « (tabs) » s'affiche) */}
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerBackground: () => <HeaderBackground />,
          headerTintColor: colors.onHeader,
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
