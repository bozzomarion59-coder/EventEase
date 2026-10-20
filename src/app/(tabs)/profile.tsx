import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getEvents } from '@/services/storage';
import { Event } from '@/types';
import { formatEventDate } from '@/utils/date';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Écran de profil : infos du compte et déconnexion, ou invitation à se connecter pour un visiteur
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [participations, setParticipations] = useState<Event[]>([]);

  // Recharge « Mes participations » à chaque retour sur l'onglet : les événements dont la liste contient mon id
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getEvents()
        .then((events) =>
          setParticipations(
            events
              .filter((e) => e.participants.includes(user.id))
              .sort((a, b) => a.date.localeCompare(b.date)),
          ),
        )
        .catch(() => setParticipations([]));
    }, [user]),
  );

  // 1. ÉTAT VISITEUR (Non connecté)
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.visitorText}>
            Connectez-vous pour créer des événements et participer.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.push('/auth/login')}
            accessibilityRole="button"
            accessibilityLabel="Aller à la page de connexion"
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </Pressable>
        </View>
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

        <Pressable
          style={[styles.button, styles.logoutButton]}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Se déconnecter de votre compte"
        >
          <Text style={[styles.buttonText, styles.logoutButtonText]}>
            Se déconnecter
          </Text>
        </Pressable>
      </View>

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
            <Ionicons name="checkmark" size={22} color="#1B6E2D" />
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

// Mêmes couleurs que la connexion et l'inscription (elles passeront dans le thème mercredi)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    padding: 24,
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#555555',
  },
  participationCard: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6B6B6B',
    borderRadius: 8,
    padding: 14,
  },
  participationText: {
    flex: 1,
    gap: 2,
  },
  participationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  participationDate: {
    fontSize: 14,
    color: '#555555',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#6B6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  visitorText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  badge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0056B3',
    backgroundColor: '#E6EEF8',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#0056B3',
    borderRadius: 8,
    minHeight: 48, // zone tactile de 48 px minimum
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B00020',
    marginTop: 16,
  },
  logoutButtonText: {
    color: '#B00020',
  },
});