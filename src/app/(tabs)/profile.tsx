import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Écran de profil (infos du compte et déconnexion ajoutées sur la branche feat/auth)
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mon profil</Text>
      <Link href="/auth/login" style={styles.link}>Se connecter</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, fontWeight: '600' },
  link: { fontSize: 16, color: '#0056B3', marginTop: 16, textDecorationLine: 'underline' },
});
