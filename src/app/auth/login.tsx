import { useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Palette } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

// Écran de connexion : vérifie l'email et le mot de passe dans le stockage local
export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    try {
      await login(email, password);
      // Connexion réussie : retour à l'écran d'où l'on venait (en général le Profil)
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Connexion impossible';
      setError(message);
      // On attend que l'écran soit mis à jour, sinon l'annonce VoiceOver est annulée
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(message);
      }, 1000);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Vitrine de l'app : icône, nom et phrase d'accroche */}
      <Image source={require('../../../assets/images/eventease-icon.png')} style={styles.logo} />
      <Text style={styles.title} accessibilityRole="header">EventEase</Text>
      <Text style={styles.subtitle}>Les événements de l’association</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Adresse email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoComplete="password"
      />
      {error !== '' && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      <Pressable
        style={styles.button}
        onPress={handleLogin}
        accessibilityRole="button"
        accessibilityLabel="Se connecter"
      >
        <Ionicons name="log-in-outline" size={22} color={colors.onPrimary} />
        <Text style={styles.buttonText}>Se connecter</Text>
      </Pressable>
      <Link href="/auth/register" style={styles.link}>
        Pas encore de compte ? S’inscrire
      </Link>
    </KeyboardAvoidingView>
  );
}

// Styles calculés à partir des couleurs du thème actif (clair ou sombre)
function makeStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      backgroundColor: colors.background,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 18,
      alignSelf: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 24,
    },
    input: {
      minHeight: 48,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: colors.surface,
      color: colors.text,
      fontSize: 16,
      marginBottom: 12,
      paddingHorizontal: 12,
    },
    button: {
      minHeight: 48,
      flexDirection: 'row',
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    error: {
      color: colors.error,
      fontSize: 15,
      marginBottom: 12,
    },
    link: {
      color: colors.primary,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 20,
      textDecorationLine: 'underline',
    },
  });
}
