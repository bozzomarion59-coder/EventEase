import { fonts } from '@/constants/fonts';
import { useTheme } from '@/contexts/ThemeContext';
import { Image, StyleSheet, Text, View } from 'react-native';

// Titre des en-têtes : l'icône EventEase suivie du titre de l'écran, sur toutes les pages
export function HeaderTitle({ children }: { children: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Image source={require('../../assets/images/eventease-icon.png')} style={[styles.icon, { borderColor: colors.onHeader }]} />
      <Text style={[styles.title, { color: colors.onHeader }]}>{children}</Text>
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
    borderRadius: 8,
    borderWidth: 2, // liseré clair : l'icône se détache du dégradé bleu nuit
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 20,
  },
});
