import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label?: string; // titre affiché au-dessus du champ (ex. « Titre * »)
};

// Champ de saisie de l'app : titre facultatif, hauteur de 48 px minimum, couleurs du thème actif.
// Accepte toutes les propriétés d'un TextInput (value, onChangeText, placeholder, secureTextEntry…)
export function TextField({ label, multiline, style, ...inputProps }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
          multiline && styles.multiline,
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  multiline: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
});
