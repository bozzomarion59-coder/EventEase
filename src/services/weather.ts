// Tous les appels à l'API OpenWeather passent par ce fichier (comme auth.ts et events.ts pour le stockage)

// Clé lue dans .env.local (non envoyé sur GitHub). Limite : elle reste lisible dans l'app installée
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

// fetch avec un message clair si le téléphone n'a pas Internet (sinon : message technique en anglais)
async function fetchOpenWeather(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch {
    throw new Error('Pas de connexion Internet. Vérifiez le réseau puis réessayez.');
  }
}

// Cherche les coordonnées d'une ville française (géocodage). Renvoie null si la ville est introuvable
export async function geocodeCity(city: string): Promise<{ latitude: number; longitude: number } | null> {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city.trim())},FR&limit=1&appid=${API_KEY}`;
  const response = await fetchOpenWeather(url);

  if (!response.ok) {
    throw new Error('Le service météo ne répond pas.');
  }

  // La réponse est un tableau de résultats, ex. [{ name: "Douai", lat: 50.37, lon: 3.08, country: "FR" }]
  const data: { lat: number; lon: number }[] = await response.json();
  if (data.length === 0) return null;

  return { latitude: data[0].lat, longitude: data[0].lon };
}

// Météo prévue à un moment donné : température, description en français, icône OpenWeather
export type Forecast = {
  temperature: number; // en °C
  description: string; // ex. « nuageux »
  icon: string;        // code d'icône, ex. « 04d »
};

// Nombre de jours couverts par la prévision gratuite d'OpenWeather
export const FORECAST_DAYS = 5;

// Prévision gratuite d'OpenWeather : 5 jours, par tranches de 3 heures.
// Renvoie la tranche la plus proche de la date de l'événement, ou null si la date est hors des 5 jours
export async function getForecast(latitude: number, longitude: number, isoDate: string): Promise<Forecast | null> {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${API_KEY}`;
  const response = await fetchOpenWeather(url);

  if (!response.ok) {
    throw new Error('Le service météo ne répond pas.');
  }

  // dt : l'heure de la tranche en secondes depuis 1970 (pas en millisecondes comme en JavaScript)
  const data: {
    list: { dt: number; main: { temp: number }; weather: { description: string; icon: string }[] }[];
  } = await response.json();

  const eventTime = new Date(isoDate).getTime();
  let closest = data.list[0];
  for (const slot of data.list) {
    if (Math.abs(slot.dt * 1000 - eventTime) < Math.abs(closest.dt * 1000 - eventTime)) {
      closest = slot;
    }
  }

  // Plus de 3 heures d'écart : l'événement est en dehors des prévisions
  if (!closest || Math.abs(closest.dt * 1000 - eventTime) > 3 * 60 * 60 * 1000) return null;

  return {
    temperature: Math.round(closest.main.temp),
    description: closest.weather[0].description,
    icon: closest.weather[0].icon,
  };
}
