import { useTheme } from '@/contexts/ThemeContext';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

// Message d'erreur en rouge, annoncé comme une alerte. N'affiche rien si le message est vide
export function ErrorMessage({ message, style }: { message: string; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  if (message === '') return null;

  return (
    <Text style={[styles.error, { color: colors.error }, style]} accessibilityRole="alert">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 15,
    marginBottom: 12,
  },
});
