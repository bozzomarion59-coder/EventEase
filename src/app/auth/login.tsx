import { useState } from 'react';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

// Écran de connexion : vérifie l'email et le mot de passe dans le stockage local
export default function LoginScreen() {
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
      <Text style={styles.title} accessibilityRole="header">Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555555"
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
        placeholderTextColor="#555555"
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
        <Ionicons name="log-in-outline" size={22} color="#FFFFFF" />
        <Text style={styles.buttonText}>Se connecter</Text>
      </Pressable>
      <Link href="/auth/register" style={styles.link}>
        Pas encore de compte ? S’inscrire
      </Link>
    </KeyboardAvoidingView>
  );
}

// Couleurs écrites en dur pour l'instant : elles passeront dans le thème mercredi
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F2F2F2',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    minHeight: 48,
    borderColor: '#6B6B6B',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  button: {
    minHeight: 48,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#0056B3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#B00020',
    fontSize: 15,
    marginBottom: 12,
  },
  link: {
    color: '#0056B3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
