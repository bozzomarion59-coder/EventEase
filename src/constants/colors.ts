// Couleurs d'EventEase, style « associatif », palette « bleu nuit et framboise », une palette par thème.
// Contrastes visés : WCAG AA, 4.5:1 pour le texte, 3:1 pour les bordures et icônes (calculés pour chaque couleur).
export type Palette = {
  background: string;        // fond des écrans
  surface: string;           // fond des cartes et des champs
  text: string;              // texte principal
  textMuted: string;         // texte secondaire, légendes, placeholder
  border: string;            // bordures épaisses des cartes, champs et boutons
  shadow: string;            // ombre décalée sous les cartes et les boutons
  primary: string;           // liens, onglet actif, boutons à contour (framboise)
  primaryGradient: readonly [string, string]; // dégradé des boutons principaux
  onPrimary: string;         // texte posé sur le dégradé des boutons
  secondary: string;         // titres et nom de l'app (bleu nuit)
  headerGradient: readonly [string, string];  // dégradé des en-têtes
  onHeader: string;          // texte et flèche retour sur l'en-tête
  backgroundGradient: readonly [string, string]; // fond en dégradé des écrans de connexion et d'inscription
  error: string;             // messages d'erreur, bouton Se déconnecter (orangé, pour ne pas se confondre avec le framboise)
  success: string;           // « Je participe », coche de Mes participations
  accent: string;            // fond du badge « Membre » / « Bénévole » (texte en primary)
  successBackground: string; // fond du badge « Je participe » (texte en success)
};

// Thème clair
export const lightColors: Palette = {
  background: '#FFF6F8',                 // rose très pâle
  surface: '#FFFFFF',
  text: '#161B33',                       // 16:1 sur le fond
  textMuted: '#4F5470',                  // 7.0:1 sur le fond
  border: '#161B33',
  shadow: '#161B33',
  primary: '#B0164F',                    // framboise, 6.4:1 sur le fond
  primaryGradient: ['#B0164F', '#C42363'], // texte blanc : 6.8:1 puis 5.6:1
  onPrimary: '#FFFFFF',
  secondary: '#1B2550',                  // bleu nuit, 13.9:1 sur le fond
  headerGradient: ['#1B2550', '#33478F'],  // texte clair : 13.9:1 puis 8.1:1
  onHeader: '#FFF6F8',
  backgroundGradient: ['#FFF6F8', '#FBDCE7'],
  error: '#C2410C',                      // 4.9:1 sur le fond
  success: '#0F5C45',                    // 7.5:1 sur le fond
  accent: '#FBDCE7',                     // primary dessus : 5.4:1
  successBackground: '#D3F4E6',          // success dessus : 6.8:1
};

// Thème sombre (contrastes calculés sur le fond #12142A)
export const darkColors: Palette = {
  background: '#12142A',
  surface: '#1D2140',
  text: '#F5F3FA',                       // 16.5:1
  textMuted: '#B9BCD6',                  // 9.7:1
  border: '#8D93C2',                     // 6.1:1
  shadow: '#07081A',
  primary: '#FF7BA8',                    // 7.5:1
  primaryGradient: ['#F2679A', '#FF8FB5'], // texte foncé : 6.2:1 puis 8.5:1
  onPrimary: '#12142A',
  secondary: '#A9B8FF',                  // 9.5:1
  headerGradient: ['#141A3D', '#26346E'],  // texte clair : 15.3:1 puis 10.6:1
  onHeader: '#F5F3FA',
  backgroundGradient: ['#12142A', '#1F1730'],
  error: '#FFA36B',                      // 9.2:1
  success: '#6FD3A8',                    // 10:1
  accent: '#4A1D33',                     // primary dessus : 5.7:1
  successBackground: '#173A2D',          // success dessus : 6.9:1
};

// Ombre décalée « dessinée à la main » des cartes et des boutons (iOS ; Android affiche une ombre classique)
export function offsetShadow(colors: Palette) {
  return {
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  };
}
