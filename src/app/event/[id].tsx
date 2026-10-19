import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Écran de détail d'événement (détails ajoutés sur la branche feat/evenements-crud)
export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Détail de l’événement ID : {id}</Text>
      <Link href={`/event/form?id=${id}`} style={styles.link}>Modifier l’événement</Link>
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
