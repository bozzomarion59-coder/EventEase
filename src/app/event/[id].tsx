import { useCallback, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Loading } from '@/components/Loading';
import { offsetShadow, Palette } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDistance } from '@/hooks/useDistance';
import { useEventWeather } from '@/hooks/useEventWeather';
import { getMemberInfo } from '@/services/auth';
import { deleteEvent, getEvent, toggleParticipation } from '@/services/events';
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
    return <Loading label="Chargement de l’événement" />;
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <ErrorMessage message={error !== '' ? error : 'Cet événement n’existe plus.'} style={styles.centeredText} />
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

      <ErrorMessage message={error} style={styles.centeredText} />

      {/* Participation : connecté = bouton bascule, visiteur = invitation à se connecter */}
      {user ? (
        <Button
          title="Je participe"
          variant={isParticipating ? 'success' : 'primary'}
          icon={isParticipating ? 'checkmark' : 'add-circle-outline'}
          onPress={handleToggleParticipation}
          accessibilityState={{ selected: isParticipating }}
          accessibilityLabel={isParticipating ? 'Je participe. Appuyer pour retirer ma participation' : 'Je participe'}
        />
      ) : (
        <Button title="Se connecter pour participer" variant="outline" onPress={() => router.push('/auth/login')} />
      )}
      {isParticipating && <Text style={styles.hint}>Un nouvel appui retire la participation.</Text>}

      {/* Modifier / Supprimer : seulement pour le créateur (services/events.ts le vérifie aussi) */}
      {isCreator && (
        <View style={styles.creatorActions}>
          <Button
            title="Modifier"
            variant="outline"
            onPress={() => router.push(`/event/form?id=${event.id}`)}
            accessibilityLabel="Modifier l’événement"
            style={styles.flexButton}
          />
          <Button
            title="Supprimer"
            variant="danger"
            onPress={handleDelete}
            accessibilityLabel="Supprimer l’événement"
            style={styles.flexButton}
          />
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
      fontFamily: fonts.heading,
      fontSize: 26,
      color: colors.text,
    },
    meta: {
      gap: 4,
    },
    metaText: {
      fontFamily: fonts.body,
      fontSize: 15,
      color: colors.textMuted,
    },
    description: {
      fontFamily: fonts.body,
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      gap: 4,
      ...offsetShadow(colors),
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
      fontFamily: fonts.bodyBold,
      fontSize: 13,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    cardValue: {
      fontFamily: fonts.bodyBold,
      fontSize: 17,
      color: colors.text,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: -8,
    },
    centeredText: {
      textAlign: 'center',
    },
    flexButton: {
      flex: 1,
    },
    creatorActions: {
      flexDirection: 'row',
      gap: 12,
    },
  });
}
