// Affiche une date ISO en français, ex. « 24 oct. 2026, 14:00 »
export function formatEventDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

// Donne le jour local d'une date au format du calendrier, ex. « 2026-10-24 »
// (pas toISOString : elle est en heure UTC, un événement à 0 h 30 tomberait la veille)
export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
