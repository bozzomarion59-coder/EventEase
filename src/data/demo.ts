import { Event } from '@/types';

// Événements copiés dans le stockage au tout premier lancement, pour que l'app ne soit pas vide.
// Dates du 23 au 25 octobre : dans les 5 jours de prévision météo gratuite, aujourd'hui comme le jour de la soutenance
export const DEMO_EVENTS: Event[] = [
  {
    id: 'demo-1',
    title: 'Atelier réparation vélo',
    description: 'Apprendre à réparer une crevaison et régler ses freins. Outils fournis.',
    date: '2026-10-24T12:00:00.000Z', // samedi 24 à 14 h
    createdBy: 'demo',
    participants: [],
    location: 'Douai',
    latitude: 50.3714,
    longitude: 3.0800,
  },
  {
    id: 'demo-2',
    title: 'Conférence : le bénévolat',
    description: 'Témoignages de bénévoles de l’association, suivis d’un échange.',
    date: '2026-10-23T16:30:00.000Z', // vendredi 23 à 18 h 30
    createdBy: 'demo',
    participants: [],
    location: 'Douai',
    latitude: 50.3714,
    longitude: 3.0800,
  },
  {
    id: 'demo-3',
    title: 'Sortie au parc',
    description: 'Pique-nique et balade, ouvert à tous.',
    date: '2026-10-25T09:00:00.000Z', // dimanche 25 à 10 h (heure d'hiver)
    createdBy: 'demo',
    participants: [],
    location: 'Lille',
    latitude: 50.6292,
    longitude: 3.0573,
  },
];
