// Affiche une date ISO en français, ex. « 24 oct. 2026, 14:00 »
export function formatEventDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}
