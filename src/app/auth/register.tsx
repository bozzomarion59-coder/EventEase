import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Palette } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { User } from '@/types';
import { announceError } from '@/utils/accessibility';

// Écran d'inscription : nom, email, mot de passe, statut et consentement
export default function RegisterScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { register } = useAuth();

  // États du formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statut, setStatut] = useState<User['statut']>('membre');
  const [hasConsented, setHasConsented] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Affiche l'erreur et la fait lire par VoiceOver / TalkBack
  function showError(message: string) {
    setErrorMessage(message);
    announceError(message);
  }

  async function handleRegister() {
    setErrorMessage('');

    if (!name || !email || !password) {
      showError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!hasConsented) {
      showError('Vous devez accepter l’enregistrement de vos données pour vous inscrire.');
      return;
    }

    try {
      await register(name, email, password, statut);
      // Inscription réussie (et session ouverte par storage.ts) : on ferme
      // l'inscription et la connexion pour revenir aux onglets
      router.dismissAll();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Une erreur est survenue lors de l’inscription.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title} accessibilityRole="header">Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez la communauté EventEase</Text>

        {/* Champ Nom */}
        <Text style={styles.label}>Nom complet *</Text>
        <TextInput
          style={styles.input}
          placeholder="Jean Dupont"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Nom complet"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
        />

        {/* Champ Email */}
        <Text style={styles.label}>Adresse e-mail *</Text>
        <TextInput
          style={styles.input}
          placeholder="exemple@email.com"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Adresse e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        {/* Champ Mot de passe */}
        <Text style={styles.label}>Mot de passe *</Text>
        <TextInput
          style={styles.input}
          placeholder="8 caractères minimum"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Mot de passe, 8 caractères minimum"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        {/* Choix du statut : deux boutons côte à côte, un seul sélectionné */}
        <Text style={styles.label}>Je m’inscris en tant que :</Text>
        <View style={styles.statusContainer} accessibilityRole="radiogroup">
          <Pressable
            style={[styles.statusButton, statut === 'membre' && styles.statusButtonActive]}
            onPress={() => setStatut('membre')}
            accessibilityRole="radio"
            accessibilityState={{ checked: statut === 'membre' }}
            accessibilityLabel="Membre"
          >
            <Text style={[styles.statusButtonText, statut === 'membre' && styles.statusButtonTextActive]}>
              Membre
            </Text>
          </Pressable>
          <Pressable
            style={[styles.statusButton, statut === 'benevole' && styles.statusButtonActive]}
            onPress={() => setStatut('benevole')}
            accessibilityRole="radio"
            accessibilityState={{ checked: statut === 'benevole' }}
            accessibilityLabel="Bénévole"
          >
            <Text style={[styles.statusButtonText, statut === 'benevole' && styles.statusButtonTextActive]}>
              Bénévole
            </Text>
          </Pressable>
        </View>

        {/* Case de consentement (obligatoire) */}
        <Pressable
          style={styles.checkboxContainer}
          onPress={() => setHasConsented(!hasConsented)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: hasConsented }}
          accessibilityLabel="J’accepte que mes données soient enregistrées sur ce téléphone"
        >
          <View style={[styles.checkbox, hasConsented && styles.checkboxChecked]}>
            {hasConsented && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
          </View>
          <Text style={styles.checkboxLabel}>
            J’accepte que mes données soient enregistrées sur ce téléphone *
          </Text>
        </Pressable>

        {/* Zone d'erreur */}
        {errorMessage !== '' && (
          <Text style={styles.error} accessibilityRole="alert">
            {errorMessage}
          </Text>
        )}

        {/* Bouton d'inscription */}
        <Pressable
          style={styles.button}
          onPress={handleRegister}
          accessibilityRole="button"
          accessibilityLabel="S’inscrire"
        >
          <Ionicons name="person-add-outline" size={22} color={colors.onPrimary} />
          <Text style={styles.buttonText}>S’inscrire</Text>
        </Pressable>

        {/* Retour à la connexion */}
        <Pressable
          style={styles.footer}
          onPress={() => router.back()}
          accessibilityRole="link"
          accessibilityLabel="Déjà un compte ? Se connecter"
        >
          <Text style={styles.footerText}>
            Déjà un compte ? <Text style={styles.link}>Se connecter</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles calculés à partir des couleurs du thème actif (clair ou sombre)
function makeStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 24,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    input: {
      minHeight: 48,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: colors.surface,
      color: colors.text,
      fontSize: 16,
      marginBottom: 16,
      paddingHorizontal: 12,
    },
    statusContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    statusButton: {
      flex: 1,
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusButtonActive: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.accent,
    },
    statusButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    statusButtonTextActive: {
      color: colors.primary,
    },
    checkboxContainer: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    error: {
      color: colors.error,
      fontSize: 15,
      marginBottom: 12,
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
    footer: {
      minHeight: 48,
      justifyContent: 'center',
      marginTop: 12,
    },
    footerText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
  });
}
