// Distance « à vol d'oiseau » entre deux points GPS, en kilomètres (formule de haversine)
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const EARTH_RADIUS_KM = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Affiche une distance en français, ex. « à 3,2 km de vous »
export function formatDistance(km: number): string {
  if (km < 1) return 'à moins d’1 km de vous';
  return `à ${km.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km de vous`;
}
