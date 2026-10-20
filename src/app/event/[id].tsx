import { useCallback, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { deleteEvent, getEvent, getMemberInfo, toggleParticipation } from '@/services/storage';
import { Event } from '@/types';
import { formatEventDate } from '@/utils/date';

// Écran de détail : infos, participation, et Modifier / Supprimer pour le créateur
export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [creatorText, setCreatorText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Affiche l'erreur et la fait lire par VoiceOver / TalkBack
  function showError(message: string) {
    setError(message);
    // Annonce différée d'une seconde, sinon elle est annulée sur iPhone
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(message);
    }, 1000);
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
        <ActivityIndicator size="large" color="#0056B3" accessibilityLabel="Chargement de l’événement" />
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
  const isParticipating = user !== null && event.participants.includes(user.id);
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
        <Text style={styles.metaText}>{creatorText}</Text>
      </View>
      {event.description !== '' && <Text style={styles.description}>{event.description}</Text>}

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
            color={isParticipating ? '#1B6E2D' : '#FFFFFF'}
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

// Mêmes couleurs que les autres écrans (elles passeront dans le thème mercredi)
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F2',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  meta: {
    gap: 4,
  },
  metaText: {
    fontSize: 15,
    color: '#555555',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6B6B6B',
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  error: {
    fontSize: 15,
    color: '#B00020',
    textAlign: 'center',
  },
  button: {
    minHeight: 52,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#0056B3',
    borderWidth: 2,
    borderColor: '#0056B3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#E3F1E6',
    borderColor: '#1B6E2D',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  buttonTextActive: {
    color: '#1B6E2D',
  },
  hint: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginTop: -8,
  },
  buttonOutline: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#0056B3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonOutlineText: {
    color: '#0056B3',
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
    borderColor: '#B00020',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonDangerText: {
    color: '#B00020',
    fontSize: 16,
    fontWeight: '600',
  },
});
