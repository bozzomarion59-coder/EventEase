// Affiche une date ISO en français, ex. « 24 oct. 2026, 14:00 »
export function formatEventDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

// Affiche seulement l'heure, ex. « 14:00 »
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Donne le jour local d'une date au format du calendrier, ex. « 2026-10-24 »
// (pas toISOString : elle est en heure UTC, un événement à 0 h 30 tomberait la veille)
export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Affiche un jour du calendrier en toutes lettres, ex. « 24 octobre 2026 »
// (new Date("2026-10-24") serait lu en UTC : on ajoute l'heure pour rester en heure locale)
export function formatDayKey(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
