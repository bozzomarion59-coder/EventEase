import { Palette } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getEvents } from '@/services/storage';
import { Event } from '@/types';
import { toDayKey } from '@/utils/date';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configuration de la locale française pour le calendrier
LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

export default function CalendarScreen() {
  const { colors, mode } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // États du calendrier
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mémorise le jour sélectionné (format "YYYY-MM-DD")
  const [selectedDate, setSelectedDate] = useState(() => toDayKey(new Date()));

  // Styles dynamiques basés sur le thème actuel
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Chargement des événements, à chaque retour sur l'onglet (un onglet reste en mémoire, useEffect ne suffirait pas)
  useFocusEffect(
    useCallback(() => {
      async function loadEvents() {
        try {
          const data = await getEvents();
          setEvents(data);
        } catch (error) {
          console.error('Erreur lors du chargement des événements :', error);
        } finally {
          setIsLoading(false);
        }
      }
      loadEvents();
    }, []),
  );

  // ÉTAPE 3 : Construction de l'objet de marquage des jours (markedDates)
  const markedDates = useMemo(() => {
    const marks: any = {};

    // 1. Parcourir la liste des événements pour ajouter les points (dots)
    events.forEach((event) => {
      const eventDate = toDayKey(new Date(event.date)); // jour local "YYYY-MM-DD"

      // Couleur du point : vert si je participe, bleu sinon
      const isParticipating = user !== null && event.participants.includes(user.id);
      const dotColor = isParticipating ? colors.success : colors.primary;

      // Initialiser le nœud du jour s'il n'existe pas encore
      if (!marks[eventDate]) {
        marks[eventDate] = { dots: [] };
      }

      // Éviter de dupliquer les points identiques (par exemple si plusieurs événements du même type le même jour)
      const dotExists = marks[eventDate].dots.some((d: any) => d.color === dotColor);
      if (!dotExists) {
        // selectedDotColor sur chaque point : sinon la librairie garde color, invisible sur le cercle bleu
        marks[eventDate].dots.push({
          color: dotColor,
          selectedDotColor: colors.onPrimary,
          key: isParticipating ? 'participating' : 'event',
        });
      }
    });

    // 2. Fusionner ou écraser avec l'état sélectionné pour conserver le focus visuel
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.onPrimary,
    };

    return marks;
  }, [events, selectedDate, colors, user]);

  // ÉTAPE 4 : Filtrer la liste des événements pour le jour sélectionné
  const eventsForSelectedDay = useMemo(() => {
    return events.filter((event) => toDayKey(new Date(event.date)) === selectedDate);
  }, [events, selectedDate]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} bounces={false}>
      {/* Le Calendrier Interactif */}
      <Calendar
        key={mode} // Force le rafraîchissement complet au basculement de thème
        firstDay={1} // Semaine commence le lundi
        current={selectedDate}
        markedDates={markedDates}
        markingType={'multi-dot'}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: colors.surface,
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.textMuted,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.onPrimary,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.border,
          dotColor: colors.primary,
          selectedDotColor: colors.onPrimary,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
        }}
        style={styles.calendar}
      />

      {/* Légende des points */}
      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
        <Text style={styles.legendText}>Événement</Text>
        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
        <Text style={styles.legendText}>Je participe</Text>
      </View>

      {/* Titre de section pour la journée sélectionnée */}
      <Text style={styles.sectionTitle}>
        Événements du {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>

      {/* ÉTAPE 4 : Affichage de la liste filtrée sous forme de cartes d'accessibilité */}
      <View style={styles.listContainer}>
        {eventsForSelectedDay.length > 0 ? (
          eventsForSelectedDay.map((event) => {
            const eventTime = new Date(event.date).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const isParticipating = user !== null && event.participants.includes(user.id);

            return (
              <Pressable
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/event/${event.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Événement à ${eventTime} : ${event.title}. ${isParticipating ? 'Vous participez.' : ''} Appuyez pour voir les détails.`}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.eventTime}>{eventTime}</Text>
                  {isParticipating && (
                    <View style={[styles.badge, { backgroundColor: colors.successBackground }]}>
                      <Text style={[styles.badgeText, { color: colors.success }]}>✓ Je participe</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.description ? (
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                ) : null}
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Aucun événement prévu pour cette journée.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      gap: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    calendar: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: 'hidden',
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      fontSize: 14,
      color: colors.textMuted,
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 8,
    },
    listContainer: {
      gap: 12,
      paddingBottom: 24,
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    eventTime: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    eventDescription: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      fontStyle: 'italic',
      marginTop: 4,
    },
  });