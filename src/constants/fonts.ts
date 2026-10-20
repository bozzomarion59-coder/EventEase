// Polices d'EventEase (Google Fonts, chargées au démarrage dans src/app/_layout.tsx).
// Une police chargée = une seule graisse : on choisit la graisse par le nom, pas avec fontWeight
export const fonts = {
  heading: 'Fredoka_600SemiBold', // titres, boutons, nom de l'app : ronde et conviviale
  body: 'Nunito_400Regular',      // texte courant
  bodyBold: 'Nunito_700Bold',     // libellés, badges, texte mis en avant
} as const;
