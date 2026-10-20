import { darkColors, lightColors, Palette } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

// Ce que le thème met à disposition de tous les écrans
type ThemeContextValue = {
  mode: ThemeMode;
  colors: Palette;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Par défaut : le thème du téléphone
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  // Au démarrage : on relit le choix enregistré, s'il existe
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') setMode(saved);
      })
      .catch(() => {});
  }, []);

  // Bascule clair / sombre, et mémorise le choix sur le téléphone
  function toggleTheme() {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }

  const colors = mode === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Raccourci pour les écrans : const { colors, mode, toggleTheme } = useTheme();
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l’intérieur de ThemeProvider');
  }
  return context;
}
