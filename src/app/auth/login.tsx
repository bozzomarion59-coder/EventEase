import { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { TextField } from '@/components/TextField';
import { Palette } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { announceError } from '@/utils/accessibility';

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
      announceError(message);
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
      <TextField
        placeholder="Email"
        accessibilityLabel="Adresse email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextField
        placeholder="Mot de passe"
        accessibilityLabel="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoComplete="password"
      />
      <ErrorMessage message={error} />
      <Button title="Se connecter" icon="log-in-outline" onPress={handleLogin} />
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
    link: {
      color: colors.primary,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 20,
      textDecorationLine: 'underline',
    },
  });
}
