import { Palette } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

// primary : action principale (fond bleu) · outline : action secondaire (contour bleu)
// danger : action destructrice (contour rouge) · success : action déjà faite (« Je participe » activé)
type Variant = 'primary' | 'outline' | 'danger' | 'success';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  accessibilityLabel?: string; // par défaut : le texte du bouton
  accessibilityState?: { selected?: boolean };
  style?: StyleProp<ViewStyle>; // placement seulement (marges, flex)
};

// Bouton de l'app : zone tactile de 48 px minimum, couleurs du thème actif
export function Button({ title, onPress, variant = 'primary', icon, disabled = false, accessibilityLabel, accessibilityState, style }: Props) {
  const { colors } = useTheme();
  const { container, text } = variantColors(colors)[variant];

  return (
    <Pressable
      style={[styles.button, container, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ ...accessibilityState, disabled }}
    >
      {icon && <Ionicons name={icon} size={22} color={text} />}
      <Text style={[styles.text, { color: text }]}>{title}</Text>
    </Pressable>
  );
}

// Couleurs de fond, de bordure et de texte pour chaque variante
function variantColors(colors: Palette): Record<Variant, { container: ViewStyle; text: string }> {
  return {
    primary: { container: { backgroundColor: colors.primary, borderColor: colors.primary }, text: colors.onPrimary },
    outline: { container: { backgroundColor: colors.surface, borderColor: colors.primary }, text: colors.primary },
    danger: { container: { backgroundColor: colors.surface, borderColor: colors.error }, text: colors.error },
    success: { container: { backgroundColor: colors.successBackground, borderColor: colors.success }, text: colors.success },
  };
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Désactivé : couleur atténuée plutôt que gris clair, pour garder un texte lisible
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
