import { useTheme } from '@/contexts/ThemeContext';
import { Image, StyleSheet, Text, View } from 'react-native';

// Titre des en-têtes : l'icône EventEase suivie du titre de l'écran, sur toutes les pages
export function HeaderTitle({ children }: { children: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Image source={require('../../assets/images/eventease-icon.png')} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
});
