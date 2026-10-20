import { Event } from '@/types';
import { FORECAST_DAYS, Forecast, getForecast } from '@/services/weather';
import { useEffect, useState } from 'react';

// Météo prévue pour un événement : la prévision, ou un message à afficher à sa place.
// Rien (null et '') pour un événement passé ou sans lieu
export function useEventWeather(event: Event | null) {
  const [weather, setWeather] = useState<Forecast | null>(null);
  const [message, setMessage] = useState('');

  // On ne dépend que du lieu et de la date : « Je participe » ne relance pas d'appel à OpenWeather
  const latitude = event?.latitude;
  const longitude = event?.longitude;
  const date = event?.date;

  useEffect(() => {
    let isCancelled = false; // l'écran a pu changer d'événement avant la réponse

    async function load() {
      setWeather(null);
      setMessage('');
      if (latitude === undefined || longitude === undefined || date === undefined) return;

      const eventTime = new Date(date).getTime();
      if (eventTime < Date.now()) return; // événement passé : pas de prévision
      if (eventTime > Date.now() + FORECAST_DAYS * 24 * 60 * 60 * 1000) {
        setMessage(`Météo disponible ${FORECAST_DAYS} jours avant l’événement.`);
        return;
      }

      setMessage('Chargement de la météo…');
      try {
        const forecast = await getForecast(latitude, longitude, date);
        if (isCancelled) return;
        setWeather(forecast);
        setMessage(forecast ? '' : 'Météo indisponible pour cette date.');
      } catch (e) {
        if (!isCancelled) setMessage(e instanceof Error ? e.message : 'Météo indisponible pour le moment.');
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [latitude, longitude, date]);

  return { weather, message };
}
