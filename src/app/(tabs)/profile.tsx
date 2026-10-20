import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { offsetShadow, Palette } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getEvents } from '@/services/events';
import { Event } from '@/types';
import { formatEventDate } from '@/utils/date';
import { isParticipant, sortByDate } from '@/utils/events';

// Écran de profil : infos du compte et déconnexion, ou invitation à se connecter pour un visiteur
export default function ProfileScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [participations, setParticipations] = useState<Event[]>([]);

  // Recharge « Mes participations » à chaque retour sur l'onglet : les événements dont la liste contient mon id
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getEvents()
        .then((events) =>
          setParticipations(sortByDate(events.filter((e) => isParticipant(e, user.id)))),
        )
        .catch(() => setParticipations([]));
    }, [user]),
  );

  // Interrupteur du mode sombre, proposé aux visiteurs comme aux membres
  const themeSwitch = (
    <View style={styles.themeRow}>
      <Text style={styles.themeLabel}>Mode sombre</Text>
      <Switch
        value={mode === 'dark'}
        onValueChange={toggleTheme}
        trackColor={{ false: colors.border, true: colors.primary }}
        ios_backgroundColor={colors.border}
        accessibilityLabel="Mode sombre"
        style={styles.themeSwitch}
      />
    </View>
  );

  // 1. ÉTAT VISITEUR (Non connecté)
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.visitorText}>
            Connectez-vous pour créer des événements et participer.
          </Text>
          <Button
            title="Se connecter"
            onPress={() => router.push('/auth/login')}
            accessibilityLabel="Aller à la page de connexion"
          />
        </View>
        {themeSwitch}
      </View>
    );
  }

  // 2. ÉTAT CONNECTÉ
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Nom complet</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Adresse e-mail</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Statut</Text>
          <Text style={styles.badge}>
            {user.statut === 'benevole' ? 'Bénévole' : 'Membre'}
          </Text>
        </View>

        <Button
          title="Se déconnecter"
          variant="danger"
          onPress={logout}
          accessibilityLabel="Se déconnecter de votre compte"
          style={styles.logoutButton}
        />
      </View>

      {themeSwitch}

      {/* Mes participations : un appui ouvre le détail de l'événement */}
      <Text style={styles.sectionTitle} accessibilityRole="header">Mes participations</Text>
      {participations.length === 0 ? (
        <Text style={styles.emptyText}>
          Vous ne participez à aucun événement. Ouvrez un événement et appuyez sur « Je participe ».
        </Text>
      ) : (
        participations.map((event) => (
          <Pressable
            key={event.id}
            style={styles.participationCard}
            onPress={() => router.push(`/event/${event.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${event.title}, ${formatEventDate(event.date)}`}
          >
            <Ionicons name="checkmark" size={22} color={colors.success} />
            <View style={styles.participationText}>
              <Text style={styles.participationTitle}>{event.title}</Text>
              <Text style={styles.participationDate}>{formatEventDate(event.date)}</Text>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

// Styles calculés à partir des couleurs du thème actif (clair ou sombre)
function makeStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 24,
      justifyContent: 'center',
    },
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      gap: 12,
    },
    themeRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 14,
      marginTop: 12,
      ...offsetShadow(colors),
    },
    // Sur iPhone, Switch se place en haut de sa ligne (alignSelf: 'flex-start') : on le recentre
    themeSwitch: {
      alignSelf: 'center',
    },
    themeLabel: {
      fontFamily: fonts.bodyBold,
      fontSize: 16,
      color: colors.text,
    },
    sectionTitle: {
      fontFamily: fonts.heading,
      fontSize: 18,
      color: colors.text,
      marginTop: 8,
    },
    emptyText: {
      fontFamily: fonts.body,
      fontSize: 15,
      color: colors.textMuted,
    },
    participationCard: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      ...offsetShadow(colors),
    },
    participationText: {
      flex: 1,
      gap: 2,
    },
    participationTitle: {
      fontFamily: fonts.heading,
      fontSize: 16,
      color: colors.text,
    },
    participationDate: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.textMuted,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      borderWidth: 2,
      borderColor: colors.border,
      ...offsetShadow(colors),
    },
    visitorText: {
      fontFamily: fonts.body,
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    infoGroup: {
      marginBottom: 20,
    },
    label: {
      fontFamily: fonts.bodyBold,
      fontSize: 13,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    value: {
      fontFamily: fonts.bodyBold,
      fontSize: 16,
      color: colors.text,
    },
    badge: {
      fontFamily: fonts.bodyBold,
      fontSize: 14,
      color: colors.primary,
      backgroundColor: colors.accent,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      overflow: 'hidden',
    },
    logoutButton: {
      marginTop: 16,
    },
  });
}
