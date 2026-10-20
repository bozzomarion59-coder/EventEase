import { useTheme } from '@/contexts/ThemeContext';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// Écran de chargement : roue centrée sur le fond du thème. label = ce que VoiceOver annonce
export function Loading({ label }: { label: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
