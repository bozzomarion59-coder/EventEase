import { Event } from '@/types';

// Événements copiés dans le stockage au tout premier lancement, pour que l'app ne soit pas vide
export const DEMO_EVENTS: Event[] = [
  {
    id: 'demo-1',
    title: 'Atelier réparation vélo',
    description: 'Apprendre à réparer une crevaison et régler ses freins. Outils fournis.',
    date: '2026-10-24T12:00:00.000Z',
    createdBy: 'demo',
    participants: [],
  },
  {
    id: 'demo-2',
    title: 'Conférence : le bénévolat',
    description: 'Témoignages de bénévoles de l’association, suivis d’un échange.',
    date: '2026-10-27T16:30:00.000Z',
    createdBy: 'demo',
    participants: [],
  },
  {
    id: 'demo-3',
    title: 'Sortie au parc',
    description: 'Pique-nique et balade, ouvert à tous.',
    date: '2026-11-01T09:00:00.000Z',
    createdBy: 'demo',
    participants: [],
  },
];