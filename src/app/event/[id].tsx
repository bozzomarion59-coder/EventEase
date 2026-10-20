import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Palette } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { deleteEvent, getEvent, getMemberInfo, toggleParticipation } from '@/services/storage';
import { useDistance } from '@/hooks/useDistance';
import { useEventWeather } from '@/hooks/useEventWeather';
import { Event } from '@/types';
import { announceError } from '@/utils/accessibility';
import { formatEventDate } from '@/utils/date';
import { isParticipant } from '@/utils/events';

// Écran de détail : infos, participation, et Modifier / Supprimer pour le créateur
export default function EventDetailScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [creatorText, setCreatorText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Météo et distance : calculées à part, sans bloquer l'affichage de l'écran
  const { weather, message: weatherMessage } = useEventWeather(event);
  const distanceText = useDistance(event?.latitude, event?.longitude);

  // Affiche l'erreur et la fait lire par VoiceOver / TalkBack
  function showError(message: string) {
    setError(message);
    announceError(message);
  }

  // Lit l'événement et le nom de son créateur
  async function loadEvent() {
    try {
      const data = await getEvent(id);
      setEvent(data);
      if (data) {
        if (data.createdBy === 'demo') {
          setCreatorText('Événement de démonstration');
        } else {
          const creator = await getMemberInfo(data.createdBy);
          const statut = creator?.statut === 'benevole' ? 'bénévole' : 'membre';
          setCreatorText(creator ? `Proposé par ${creator.name}, ${statut}` : 'Proposé par un ancien membre');
        }
      }
    } catch {
      showError('Impossible de charger l’événement.');
    } finally {
      setIsLoading(false);
    }
  }

  // Recharge au retour du formulaire de modification
  useFocusEffect(
    useCallback(() => {
      loadEvent();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]),
  );

  // Ajoute ou retire la participation, puis recharge
  async function handleToggleParticipation() {
    if (!user || !event) return;
    setError('');
    try {
      await toggleParticipation(event.id, user.id);
      await loadEvent();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'La participation n’a pas pu être enregistrée.');
    }
  }

  // Demande confirmation avant de supprimer (action irréversible)
  function handleDelete() {
    if (!user || !event) return;
    Alert.alert('Supprimer l’événement', `Supprimer « ${event.title} » ? Cette action est définitive.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(event.id, user.id);
            router.back();
          } catch (e) {
            showError(e instanceof Error ? e.message : 'La suppression a échoué.');
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Chargement de l’événement" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.error} accessibilityRole="alert">
          {error !== '' ? error : 'Cet événement n’existe plus.'}
        </Text>
      </View>
    );
  }

  const isCreator = user !== null && event.createdBy === user.id;
  const isParticipating = isParticipant(event, user?.id);
  const count = event.participants.length;
  const countText =
    count === 0
      ? 'Aucun participant'
      : `${count} participant${count > 1 ? 's' : ''}${isParticipating ? ', dont vous' : ''}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">{event.title}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{formatEventDate(event.date)}</Text>
        {event.location && (
          <Text style={styles.metaText}>
            Lieu : {event.location}
            {distanceText !== '' && `, ${distanceText}`}
          </Text>
        )}
        <Text style={styles.metaText}>{creatorText}</Text>
      </View>
      {event.description !== '' && <Text style={styles.description}>{event.description}</Text>}

      {/* Météo prévue (OpenWeather) : l'icône vient du site d'OpenWeather */}
      {(weather || weatherMessage !== '') && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Météo prévue</Text>
          {weather ? (
            <View style={styles.weatherRow}>
              <Image
                source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
                style={styles.weatherIcon}
              />
              <Text style={styles.cardValue}>
                {weather.temperature} °C, {weather.description}
              </Text>
            </View>
          ) : (
            <Text style={styles.metaText}>{weatherMessage}</Text>
          )}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Participants</Text>
        <Text style={styles.cardValue}>{countText}</Text>
      </View>

      {error !== '' && (
        <Text style={styles.error} accessibilityRole="alert">{error}</Text>
      )}

      {/* Participation : connecté = bouton bascule, visiteur = invitation à se connecter */}
      {user ? (
        <Pressable
          style={[styles.button, isParticipating && styles.buttonActive]}
          onPress={handleToggleParticipation}
          accessibilityRole="button"
          accessibilityState={{ selected: isParticipating }}
          accessibilityLabel={isParticipating ? 'Je participe. Appuyer pour retirer ma participation' : 'Je participe'}
        >
          <Ionicons
            name={isParticipating ? 'checkmark' : 'add-circle-outline'}
            size={22}
            color={isParticipating ? colors.success : colors.onPrimary}
          />
          <Text style={[styles.buttonText, isParticipating && styles.buttonTextActive]}>Je participe</Text>
        </Pressable>
      ) : (
        <Pressable
          style={styles.buttonOutline}
          onPress={() => router.push('/auth/login')}
          accessibilityRole="button"
          accessibilityLabel="Se connecter pour participer"
        >
          <Text style={styles.buttonOutlineText}>Se connecter pour participer</Text>
        </Pressable>
      )}
      {isParticipating && <Text style={styles.hint}>Un nouvel appui retire la participation.</Text>}

      {/* Modifier / Supprimer : seulement pour le créateur (storage.ts le vérifie aussi) */}
      {isCreator && (
        <View style={styles.creatorActions}>
          <Pressable
            style={styles.buttonOutline}
            onPress={() => router.push(`/event/form?id=${event.id}`)}
            accessibilityRole="button"
            accessibilityLabel="Modifier l’événement"
          >
            <Text style={styles.buttonOutlineText}>Modifier</Text>
          </Pressable>
          <Pressable
            style={styles.buttonDanger}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Supprimer l’événement"
          >
            <Text style={styles.buttonDangerText}>Supprimer</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

// Styles calculés à partir des couleurs du thème actif (clair ou sombre)
function makeStyles(colors: Palette) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      gap: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
    },
    meta: {
      gap: 4,
    },
    metaText: {
      fontSize: 15,
      color: colors.textMuted,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 14,
      gap: 4,
    },
    weatherRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    weatherIcon: {
      width: 48,
      height: 48,
    },
    cardLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    cardValue: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    error: {
      fontSize: 15,
      color: colors.error,
      textAlign: 'center',
    },
    button: {
      minHeight: 52,
      flexDirection: 'row',
      gap: 8,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonActive: {
      backgroundColor: colors.successBackground,
      borderColor: colors.success,
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 17,
      fontWeight: 'bold',
    },
    buttonTextActive: {
      color: colors.success,
    },
    hint: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: -8,
    },
    buttonOutline: {
      flex: 1,
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    buttonOutlineText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    creatorActions: {
      flexDirection: 'row',
      gap: 12,
    },
    buttonDanger: {
      flex: 1,
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    buttonDangerText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
