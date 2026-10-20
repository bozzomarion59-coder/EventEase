// Événements et participation, enregistrés sur le téléphone (ce fichier joue le rôle de l'API des événements)
import { DEMO_EVENTS } from '@/data/demo';
import { Event, EventInput } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// v3 : démos avec un lieu et des dates proches (une nouvelle clé recharge les démos au prochain lancement)
const EVENTS_KEY = 'events_v3';

// Enregistre la liste des événements sur le téléphone
async function saveEvents(events: Event[]): Promise<void> {
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

// Vérifie et nettoie les champs saisis dans le formulaire
function cleanInput(input: EventInput): EventInput {
  const title = input.title.trim();
  if (!title) throw new Error('Le titre de l’événement ne peut pas être vide.');
  return { ...input, title, description: input.description.trim(), location: input.location.trim() };
}

// Trouve un événement que l'utilisateur a le droit de modifier ou de supprimer (seul son créateur)
function findOwnedEvent(events: Event[], id: string, userId: string, action: string): Event {
  const event = events.find((e) => e.id === id);
  if (!event) throw new Error('Événement introuvable.');
  if (event.createdBy !== userId) throw new Error(`Seul le créateur peut ${action} cet événement.`);
  return event;
}

// Lit les événements enregistrés. Premier lancement (clé absente) : copie les événements de démonstration
export async function getEvents(): Promise<Event[]> {
  const json = await AsyncStorage.getItem(EVENTS_KEY);
  if (json === null) {
    await saveEvents(DEMO_EVENTS);
    return DEMO_EVENTS;
  }
  return JSON.parse(json);
}

// Récupère un événement par son identifiant (null s'il a été supprimé)
export async function getEvent(id: string): Promise<Event | null> {
  return (await getEvents()).find((e) => e.id === id) ?? null;
}

// Crée un événement au nom de l'utilisateur connecté
export async function createEvent(input: EventInput, userId: string): Promise<Event> {
  const events = await getEvents();
  const newEvent: Event = {
    ...cleanInput(input),
    id: Crypto.randomUUID(),
    createdBy: userId,
    participants: [],
  };
  await saveEvents([...events, newEvent]);
  return newEvent;
}

// Modifie un événement (réservé à son créateur)
export async function updateEvent(id: string, input: EventInput, userId: string): Promise<void> {
  const events = await getEvents();
  findOwnedEvent(events, id, userId, 'modifier');
  const changes = cleanInput(input);
  await saveEvents(events.map((e) => (e.id === id ? { ...e, ...changes } : e)));
}

// Supprime un événement (réservé à son créateur)
export async function deleteEvent(id: string, userId: string): Promise<void> {
  const events = await getEvents();
  findOwnedEvent(events, id, userId, 'supprimer');
  await saveEvents(events.filter((e) => e.id !== id));
}

// Ajoute l'utilisateur aux participants, ou le retire s'il y est déjà
export async function toggleParticipation(id: string, userId: string): Promise<void> {
  const events = await getEvents();
  const event = events.find((e) => e.id === id);
  if (!event) throw new Error('Événement introuvable.');

  const participants = event.participants.includes(userId)
    ? event.participants.filter((p) => p !== userId)
    : [...event.participants, userId];

  await saveEvents(events.map((e) => (e.id === id ? { ...e, participants } : e)));
}
