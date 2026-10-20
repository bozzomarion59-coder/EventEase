import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
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
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Palette } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createEvent, getEvent, updateEvent } from '@/services/storage';

// Formulaire d'événement : création (sans id) ou modification (avec ?id=), réservé au créateur
export default function EventFormScreen() {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id); // un id dans l'adresse = modification

  // États du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // demain
    d.setHours(18, 0, 0, 0); // à 18 h 00
    return d;
  });

  // Chargement, droit de modifier et erreur
  const [isLoading, setIsLoading] = useState(isEdit);
  const [canEdit, setCanEdit] = useState(!isEdit);
  const [errorMessage, setErrorMessage] = useState('');

  // Affiche l'erreur et la fait lire par VoiceOver / TalkBack
  function showError(message: string) {
    setErrorMessage(message);
    // Annonce différée d'une seconde, sinon elle est annulée sur iPhone
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(`Erreur : ${message}`);
    }, 1000);
  }

  // En modification : préremplit les champs, si l'utilisateur est bien le créateur
  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      try {
        const event = await getEvent(id);
        if (!event) {
          showError('Événement introuvable.');
          return;
        }
        if (event.createdBy !== user?.id) {
          showError('Seul le créateur peut modifier cet événement.');
          return;
        }
        setTitle(event.title);
        setDescription(event.description);
        setDate(new Date(event.date));
        setCanEdit(true);
      } catch {
        showError('Une erreur est survenue lors du chargement.');
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [id, user?.id]);

  async function handleSubmit() {
    if (!user) return;
    setErrorMessage('');

    try {
      if (id) {
        await updateEvent(id, title, description, date.toISOString(), user.id);
      } else {
        await createEvent(title, description, date.toISOString(), user.id);
      }
      router.back();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    }
  }

  const isSubmitDisabled = !title.trim() || !canEdit;
  const timeText = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Chargement de l’événement" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Titre de l'en-tête selon le cas */}
      <Stack.Screen options={{ title: isEdit ? 'Modifier l’événement' : 'Nouvel événement' }} />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Champ Titre */}
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex. : Atelier couture"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Titre de l’événement, obligatoire"
          value={title}
          onChangeText={setTitle}
        />

        {/* Champ Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez l’événement…"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Description de l’événement"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Sélecteur de date et d'heure */}
        <Text style={styles.label}>Date et heure</Text>
        {Platform.OS === 'ios' ? (
          // iPhone : un seul sélecteur pour la date et l'heure
          <View style={styles.iosPicker}>
            <DateTimePicker
              value={date}
              mode="datetime"
              display="compact"
              locale="fr-FR"
              // Suit le thème de l'app, pas celui du téléphone (sinon texte illisible si les deux diffèrent)
              themeVariant={mode}
              minimumDate={new Date()}
              onValueChange={(_, selected) => setDate(selected)}
              accessibilityLabel="Date et heure de l’événement"
            />
          </View>
        ) : (
          // Android : pas de mode « date + heure », deux boutons ouvrent chacun une fenêtre
          <View style={styles.dateRow}>
            <Pressable
              style={styles.dateButton}
              onPress={() =>
                DateTimePickerAndroid.open({
                  value: date,
                  mode: 'date',
                  minimumDate: new Date(),
                  onValueChange: (_, selected) => setDate(selected),
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Date : ${date.toLocaleDateString('fr-FR')}. Modifier la date`}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateButtonText}>{date.toLocaleDateString('fr-FR')}</Text>
            </Pressable>
            <Pressable
              style={styles.dateButton}
              onPress={() =>
                DateTimePickerAndroid.open({
                  value: date,
                  mode: 'time',
                  is24Hour: true,
                  onValueChange: (_, selected) => setDate(selected),
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Heure : ${timeText}. Modifier l’heure`}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.dateButtonText}>{timeText}</Text>
            </Pressable>
          </View>
        )}

        {/* Zone d'erreur */}
        {errorMessage !== '' && (
          <Text style={styles.error} accessibilityRole="alert">
            {errorMessage}
          </Text>
        )}

        {/* Bouton de soumission, désactivé sans titre ou sans droit de modifier */}
        <Pressable
          style={[styles.button, isSubmitDisabled && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitDisabled }}
          accessibilityLabel={isEdit ? 'Enregistrer les modifications' : 'Créer l’événement'}
        >
          <Ionicons name={isEdit ? 'save-outline' : 'add-circle-outline'} size={22} color={colors.onPrimary} />
          <Text style={styles.buttonText}>{isEdit ? 'Enregistrer' : 'Créer l’événement'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles calculés à partir des couleurs du thème actif (clair ou sombre)
function makeStyles(colors: Palette) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 16,
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
    textArea: {
      minHeight: 110,
      paddingTop: 12,
      textAlignVertical: 'top',
    },
    iosPicker: {
      alignSelf: 'flex-start',
      minHeight: 48,
      justifyContent: 'center',
      marginBottom: 16,
    },
    dateRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    dateButton: {
      flex: 1,
      minHeight: 48,
      flexDirection: 'row',
      gap: 8,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateButtonText: {
      fontSize: 16,
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
      marginTop: 4,
    },
    // Désactivé : bleu atténué plutôt que gris clair, pour garder un texte lisible
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
}
