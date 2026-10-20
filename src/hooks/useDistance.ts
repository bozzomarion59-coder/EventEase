import { distanceKm, formatDistance } from '@/utils/distance';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

// Distance entre le téléphone et un lieu, ex. « à 3,2 km de vous ».
// Demande l'autorisation de localisation la première fois (iOS retient ensuite la réponse)
export function useDistance(latitude: number | undefined, longitude: number | undefined): string {
  const [text, setText] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setText('');
      if (latitude === undefined || longitude === undefined) return; // ancien événement sans lieu

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!isCancelled) setText('autorisez la localisation pour voir la distance');
          return;
        }
        // Précision « Balanced » : assez pour une distance en km, plus rapide et moins gourmande que le GPS fin
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (isCancelled) return;
        setText(formatDistance(distanceKm(position.coords.latitude, position.coords.longitude, latitude, longitude)));
      } catch {
        if (!isCancelled) setText('position indisponible');
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [latitude, longitude]);

  return text;
}
