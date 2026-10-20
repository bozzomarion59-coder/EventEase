import { Loading } from '@/components/Loading';
import { offsetShadow, Palette } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getEvents } from '@/services/events';
import { Event } from '@/types';
import { formatDayKey, formatTime, toDayKey } from '@/utils/date';
import { isParticipant, sortByDate } from '@/utils/events';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';

// Configuration de la locale française pour le calendrier
LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

// Onglet Calendrier : un point sous chaque jour qui a un événement, la liste du jour choisi en dessous
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
          setEvents(sortByDate(data)); // la liste du jour sera dans l'ordre des heures
        } catch (error) {
          console.error('Erreur lors du chargement des événements :', error);
        } finally {
          setIsLoading(false);
        }
      }
      loadEvents();
    }, []),
  );

  // Points du calendrier, par jour : { "2026-10-24": { dots: [...] }, ... }
  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};

    // 1. Un point par jour qui a un événement
    events.forEach((event) => {
      const eventDate = toDayKey(new Date(event.date)); // jour local "YYYY-MM-DD"

      // Couleur du point : vert si je participe, bleu sinon
      const isParticipating = isParticipant(event, user?.id);
      const dotColor = isParticipating ? colors.success : colors.primary;

      // Un seul point de chaque couleur par jour, même s'il y a plusieurs événements
      const dots = marks[eventDate]?.dots ?? [];
      if (!dots.some((dot) => dot.color === dotColor)) {
        // selectedDotColor sur chaque point : sinon la librairie garde color, invisible sur le cercle bleu
        dots.push({
          color: dotColor,
          selectedDotColor: colors.onPrimary,
          key: isParticipating ? 'participating' : 'event',
        });
      }
      marks[eventDate] = { dots };
    });

    // 2. Le jour choisi : cercle bleu, en gardant ses points
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.onPrimary,
    };

    return marks;
  }, [events, selectedDate, colors, user]);

  // Événements du jour choisi
  const eventsForSelectedDay = useMemo(() => {
    return events.filter((event) => toDayKey(new Date(event.date)) === selectedDate);
  }, [events, selectedDate]);

  if (isLoading) {
    return <Loading label="Chargement du calendrier" />;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} bounces={false}>
      {/* Calendrier du mois */}
      <View style={styles.calendarShadow}>
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
            textDisabledColor: colors.textMuted,
            dotColor: colors.primary,
            selectedDotColor: colors.onPrimary,
            arrowColor: colors.primary,
            monthTextColor: colors.text,
            textMonthFontFamily: fonts.heading,
            textDayFontFamily: fonts.body,
            textDayHeaderFontFamily: fonts.bodyBold,
          }}
          style={styles.calendar}
        />
      </View>

      {/* Légende des points */}
      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
        <Text style={styles.legendText}>Événement</Text>
        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
        <Text style={styles.legendText}>Je participe</Text>
      </View>

      {/* Titre de section pour la journée sélectionnée */}
      <Text style={styles.sectionTitle}>
        Événements du {formatDayKey(selectedDate)}
      </Text>

      {/* Liste du jour : un appui ouvre le détail */}
      <View style={styles.listContainer}>
        {eventsForSelectedDay.length > 0 ? (
          eventsForSelectedDay.map((event) => {
            const eventTime = formatTime(new Date(event.date));
            const isParticipating = isParticipant(event, user?.id);

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

// Styles calculés à partir des couleurs du thème actif (clair ou sombre)
function makeStyles(colors: Palette) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      gap: 16,
    },
    calendar: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: 'hidden', // les coins arrondis coupent le fond du calendrier
    },
    // L'ombre est sur un cadre autour : overflow: hidden la couperait sur iOS
    calendarShadow: {
      borderRadius: 16,
      backgroundColor: colors.surface,
      ...offsetShadow(colors),
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
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.textMuted,
      marginRight: 12,
    },
    sectionTitle: {
      fontFamily: fonts.heading,
      fontSize: 18,
      color: colors.text,
      marginTop: 8,
    },
    listContainer: {
      gap: 12,
      paddingBottom: 24,
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      ...offsetShadow(colors),
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    eventTime: {
      fontFamily: fonts.bodyBold,
      fontSize: 14,
      color: colors.primary,
    },
    eventTitle: {
      fontFamily: fonts.heading,
      fontSize: 16,
      color: colors.text,
      marginBottom: 4,
    },
    eventDescription: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeText: {
      fontFamily: fonts.bodyBold,
      fontSize: 11,
    },
    emptyText: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.textMuted,
      fontStyle: 'italic',
      marginTop: 4,
    },
  });
}
