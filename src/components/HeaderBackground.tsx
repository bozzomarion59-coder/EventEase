import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

// Fond des en-têtes : dégradé bleu nuit, de gauche à droite, avec un trait foncé en bas
export function HeaderBackground() {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={colors.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[StyleSheet.absoluteFill, styles.border, { borderBottomColor: colors.shadow }]}
    />
  );
}

const styles = StyleSheet.create({
  border: {
    borderBottomWidth: 3,
  },
});
