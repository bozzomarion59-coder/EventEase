import { AccessibilityInfo } from 'react-native';

// Fait lire un message d'erreur par VoiceOver / TalkBack.
// Annonce différée d'une seconde : sur iPhone, une annonce faite pendant la mise à jour de l'écran est annulée
export function announceError(message: string) {
  setTimeout(() => {
    AccessibilityInfo.announceForAccessibility(`Erreur : ${message}`);
  }, 1000);
}
