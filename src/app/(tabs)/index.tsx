import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Loading } from '@/components/Loading';
import { Palette } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getEvents } from '@/services/events';
import { Event } from '@/types';
import { formatEventDate } from '@/utils/date';
import { isParticipant, sortByDate } from '@/utils/events';

// Écran d'accueil : liste des événements triés par date, visible sans connexion
export default function EventListScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Lit les événements dans le stockage et les trie du plus proche au plus lointain
  async function loadEvents() {
    try {
      setError('');
      const data = await getEvents();
      setEvents(sortByDate(data));
    } catch {
      setError('Impossible de charger les événements.');
    } finally {
      setIsLoading(false);
    }
  }

  // Recharge à chaque retour sur l'onglet (un onglet reste en mémoire, useEffect ne suffirait pas)
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, []),
  );

  // État 1 : chargement
  if (isLoading) {
    return <Loading label="Chargement des événements" />;
  }

  // État 2 : erreur
  if (error !== '') {
    return (
      <View style={styles.center}>
        <ErrorMessage message={error} style={styles.centeredText} />
      </View>
    );
  }

  // État 3 : les données
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={events}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.empty}>Aucun événement pour l’instant.</Text>}
      renderItem={({ item }) => {
        const isParticipating = isParticipant(item, user?.id);
        const count = item.participants.length;
        const countText = count === 0 ? 'Aucun participant' : `${count} participant${count > 1 ? 's' : ''}`;

        return (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/event/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${formatEventDate(item.date)}, ${countText}${isParticipating ? ', vous participez' : ''}`}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              {isParticipating && <Text style={styles.badge}>✓ Je participe</Text>}
            </View>
            <Text style={styles.date}>{formatEventDate(item.date)}</Text>
            {item.description !== '' && (
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            )}
            <Text style={styles.count}>{countText}</Text>
          </Pressable>
        );
      }}
      ListFooterComponent={
        // Créer un événement : réservé aux membres connectés
        user ? (
          <Button
            title="Créer un événement"
            icon="add-circle-outline"
            onPress={() => router.push('/event/form')}
            style={styles.footerButton}
          />
        ) : (
          <Button
            title="Se connecter pour créer ou participer"
            variant="outline"
            onPress={() => router.push('/auth/login')}
            accessibilityLabel="Se connecter pour créer un événement ou participer"
            style={styles.footerButton}
          />
        )
      }
    />
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
    list: {
      backgroundColor: colors.background,
    },
    listContent: {
      padding: 16,
      gap: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 14,
      gap: 6,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: 'bold',
      color: colors.text,
    },
    badge: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.success,
      backgroundColor: colors.successBackground,
      borderRadius: 8,
      overflow: 'hidden',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    date: {
      fontSize: 14,
      color: colors.textMuted,
    },
    description: {
      fontSize: 15,
      color: colors.text,
    },
    count: {
      fontSize: 13,
      color: colors.textMuted,
    },
    empty: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      marginVertical: 24,
    },
    centeredText: {
      textAlign: 'center',
    },
    footerButton: {
      marginTop: 4,
    },
  });
}
