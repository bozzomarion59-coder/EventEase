import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Écran d'accueil : liste des événements, visible sans connexion (liste ajoutée sur la branche feat/evenements-crud)
export default function EventListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Événements</Text>
      <Link href="/event/1" style={styles.link}>Voir l’événement</Link>
      <Link href="/event/form" style={styles.link}>Créer un événement</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, fontWeight: '600' },
  link: { fontSize: 16, color: '#0056B3', marginTop: 16, textDecorationLine: 'underline' },
});
