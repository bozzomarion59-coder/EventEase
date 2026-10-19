import { StyleSheet, Text, View } from 'react-native';

// Écran du formulaire d'événement (formulaire ajouté sur la branche feat/evenements-crud)
export default function EventFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Formulaire d’événement</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, fontWeight: '600' },
});
