// Couleurs d'EventEase, une palette par thème (clair / sombre).
// Contrastes visés : WCAG AA, 4.5:1 pour le texte, 3:1 pour les bordures et icônes.
export type Palette = {
  background: string;        // fond des écrans
  surface: string;           // fond des cartes et des champs
  text: string;              // texte principal
  textMuted: string;         // texte secondaire, légendes, placeholder
  border: string;            // bordures des cartes et des champs
  primary: string;           // boutons, liens, onglet actif
  onPrimary: string;         // texte posé sur un bouton primary
  error: string;             // messages d'erreur, bouton Se déconnecter
  success: string;           // « Je participe », coche de Mes participations
  accent: string;            // fond du badge « Membre » / « Bénévole » (texte en primary)
  successBackground: string; // fond du badge « Vous participez » (texte en success)
};

// Thème clair : les couleurs déjà utilisées dans les écrans
export const lightColors: Palette = {
  background: '#F2F2F2',
  surface: '#FFFFFF',
  text: '#1A1A1A',              // 15.5:1 sur le fond
  textMuted: '#555555',         // 6.7:1 sur le fond
  border: '#6B6B6B',            // 4.8:1 sur le fond
  primary: '#0056B3',           // texte blanc sur ce bleu : 7.0:1
  onPrimary: '#FFFFFF',
  error: '#B00020',             // 6.5:1 sur le fond
  success: '#1B6E2D',           // environ 5.7:1 sur le fond
  accent: '#E6EEF8',            // primary dessus : 6.0:1
  successBackground: '#E3F1E6', // success dessus : 5.4:1
};

// Thème sombre (contrastes calculés sur le fond #121212)
export const darkColors: Palette = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#F2F2F2',              // environ 16:1
  textMuted: '#B3B3B3',         // environ 8.9:1
  border: '#8C8C8C',            // environ 5.6:1
  primary: '#6AB0FF',           // bleu éclairci, environ 8:1 ; texte foncé dessus
  onPrimary: '#0A0A0A',
  error: '#FF8A80',             // environ 8:1
  success: '#81C995',           // environ 9.6:1
  accent: '#1A2A3A',            // primary dessus : 6.5:1
  successBackground: '#1C3323', // success dessus : 6.9:1
};
