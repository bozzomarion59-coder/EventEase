import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Écran de connexion (formulaire ajouté sur la branche feat/auth)
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Connexion</Text>
      <Link href="/auth/register" style={styles.link}>Pas encore de compte ? S’inscrire</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    color: '#0056B3',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
});
