import { offsetShadow, Palette } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ComponentProps } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

// primary : action principale (dégradé framboise) · outline : action secondaire (contour framboise)
// danger : action destructrice (contour orangé) · success : action déjà faite (« Je participe » activé)
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

// Bouton de l'app : bordure épaisse, ombre décalée, zone tactile de 48 px minimum, couleurs du thème actif
export function Button({ title, onPress, variant = 'primary', icon, disabled = false, accessibilityLabel, accessibilityState, style }: Props) {
  const { colors } = useTheme();
  const { background, text } = variantColors(colors)[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.border, backgroundColor: background },
        // Appuyé : le bouton « s'enfonce » dans son ombre
        pressed ? styles.pressed : offsetShadow(colors),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ ...accessibilityState, disabled }}
    >
      {/* Bouton principal : le dégradé remplit tout le bouton, derrière le texte */}
      {variant === 'primary' && (
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.gradient]}
        />
      )}
      {icon && <Ionicons name={icon} size={22} color={text} />}
      <Text style={[styles.text, { color: text }]}>{title}</Text>
    </Pressable>
  );
}

// Fond et couleur du texte pour chaque variante (le fond du bouton principal est le dégradé)
function variantColors(colors: Palette): Record<Variant, { background: string; text: string }> {
  return {
    primary: { background: colors.primaryGradient[0], text: colors.onPrimary },
    outline: { background: colors.surface, text: colors.primary },
    danger: { background: colors.surface, text: colors.error },
    success: { background: colors.successBackground, text: colors.success },
  };
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Coins du dégradé = coins du bouton moins la bordure (pas d'overflow: hidden, qui couperait l'ombre sur iOS)
  gradient: {
    borderRadius: 14,
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  // Désactivé : couleur atténuée plutôt que gris clair, pour garder un texte lisible
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: fonts.heading,
    fontSize: 17,
  },
});
