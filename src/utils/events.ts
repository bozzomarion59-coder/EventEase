import { Event } from '@/types';

// Vrai si l'utilisateur connecté participe à l'événement (faux pour un visiteur)
export function isParticipant(event: Event, userId: string | undefined): boolean {
  return userId !== undefined && event.participants.includes(userId);
}

// Trie les événements du plus proche au plus lointain (les dates ISO se trient comme du texte)
export function sortByDate(events: Event[]): Event[] {
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}
