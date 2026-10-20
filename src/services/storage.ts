// Toutes les données de l'app passent par ce fichier (il joue le rôle de l'API)
import { DEMO_EVENTS } from '@/data/demo';
import { Event, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Les clés sous lesquelles les données sont rangées dans AsyncStorage
const USERS_KEY = 'users';
const SESSION_KEY = 'session';
const EVENTS_KEY = 'events_v3'; // v3 : démos avec un lieu et des dates proches (rechargées au prochain lancement)

// ==========================================
// GESTION DES UTILISATEURS
// ==========================================

// Lit la liste des comptes enregistrés sur le téléphone
async function getUsers(): Promise<User[]> {
  const json = await AsyncStorage.getItem(USERS_KEY);
  return json ? JSON.parse(json) : [];
}

// Enregistre la liste des comptes sur le téléphone
async function saveUsers(users: User[]): Promise<void> {
  const json = JSON.stringify(users);
  await AsyncStorage.setItem(USERS_KEY, json);
}

// Hache le mot de passe avec le sel de l'utilisateur (SHA-256)
async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);
}

// Crée un compte. Lance une erreur si les données sont invalides ou si l'email est déjà pris.
export async function registerUser(
  name: string,
  email: string,
  password: string,
  statut: User['statut'],
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName) throw new Error('Le nom ne peut pas être vide.');
  if (!cleanEmail.includes('@')) throw new Error('L’adresse e-mail n’est pas valide.');
  if (password.length < 8) throw new Error('Le mot de passe doit contenir au moins 8 caractères.');

  const users = await getUsers();
  const emailExists = users.some((u) => u.email === cleanEmail);
  if (emailExists) throw new Error('Cette adresse e-mail est déjà utilisée.');

  const salt = Crypto.randomUUID();
  const passwordHash = await hashPassword(password, salt);

  const newUser: User = {
    id: Crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    statut,
    passwordHash,
    salt,
  };

  await saveUsers([...users, newUser]);
  await AsyncStorage.setItem(SESSION_KEY, newUser.id);

  return newUser;
}

// Connecte un utilisateur. Lance une erreur générique si l'email ou le mot de passe est incorrect.
export async function loginUser(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();

  const users = await getUsers();
  const user = users.find((u) => u.email === cleanEmail);

  if (!user) throw new Error('Email ou mot de passe incorrect.');

  const inputHash = await hashPassword(password, user.salt);
  if (inputHash !== user.passwordHash) throw new Error('Email ou mot de passe incorrect.');

  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return user;
}

// Récupère l'utilisateur actuellement connecté au démarrage
export async function getSessionUser(): Promise<User | null> {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  if (!userId) return null;

  const users = await getUsers();
  return users.find((u) => u.id === userId) || null;
}

// Déconnecte l'utilisateur en effaçant sa session
export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// Renvoie seulement le nom et le statut d'un membre (jamais son email ni son mot de passe haché)
export async function getMemberInfo(id: string): Promise<Pick<User, 'name' | 'statut'> | null> {
  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  return user ? { name: user.name, statut: user.statut } : null;
}

// ==========================================
// GESTION DES ÉVÉNEMENTS
// ==========================================

// Enregistre la liste des événements sur le téléphone (Privée)
async function saveEvents(events: Event[]): Promise<void> {
  const json = JSON.stringify(events);
  await AsyncStorage.setItem(EVENTS_KEY, json);
}

// Lit la liste des événements enregistrés ou charge les démos au 1er lancement
export async function getEvents(): Promise<Event[]> {
  const json = await AsyncStorage.getItem(EVENTS_KEY);

  // Premier lancement strict : la clé n'existe pas du tout dans AsyncStorage
  if (json === null) {
    await saveEvents(DEMO_EVENTS);
    return DEMO_EVENTS;
  }

  return JSON.parse(json);
}

// Récupère un événement spécifique par son identifiant unique
export async function getEvent(id: string): Promise<Event | null> {
  const events = await getEvents();
  return events.find((e) => e.id === id) || null;
}

// ==========================================
// CRUD ET ACTIONS SUR LES ÉVÉNEMENTS
// ==========================================

// Crée un nouvel événement
export async function createEvent(
  title: string,
  description: string,
  date: string,
  location: string,
  latitude: number,
  longitude: number,
  userId: string
): Promise<Event> {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    throw new Error('Le titre de l’événement ne peut pas être vide.');
  }

  const events = await getEvents();

  const newEvent: Event = {
    id: Crypto.randomUUID(),
    title: cleanTitle,
    description: description.trim(),
    date,
    location: location.trim(),
    latitude,
    longitude,
    createdBy: userId,
    participants: [],
  };

  await saveEvents([...events, newEvent]);
  return newEvent;
}

// Modifie un événement existant (Vérification du créateur intégrée)
export async function updateEvent(
  id: string,
  title: string,
  description: string,
  date: string,
  location: string,
  latitude: number,
  longitude: number,
  userId: string
): Promise<void> {
  const events = await getEvents();
  const event = events.find((e) => e.id === id);

  if (!event) {
    throw new Error('Événement introuvable.');
  }

  if (event.createdBy !== userId) {
    throw new Error('Seul le créateur peut modifier cet événement.');
  }

  const cleanTitle = title.trim();
  if (!cleanTitle) {
    throw new Error('Le titre de l’événement ne peut pas être vide.');
  }

  const updatedEvents = events.map((e) =>
    e.id === id
      ? { ...e, title: cleanTitle, description: description.trim(), date, location: location.trim(), latitude, longitude }
      : e
  );

  await saveEvents(updatedEvents);
}

// Supprime un événement (Vérification du créateur intégrée)
export async function deleteEvent(id: string, userId: string): Promise<void> {
  const events = await getEvents();
  const event = events.find((e) => e.id === id);

  if (!event) {
    throw new Error('Événement introuvable.');
  }

  if (event.createdBy !== userId) {
    throw new Error('Seul le créateur peut supprimer cet événement.');
  }

  const filteredEvents = events.filter((e) => e.id !== id);
  await saveEvents(filteredEvents);
}

// Alterne l'inscription ou la désinscription d'un membre à un événement
export async function toggleParticipation(id: string, userId: string): Promise<void> {
  const events = await getEvents();
  const event = events.find((e) => e.id === id);

  if (!event) {
    throw new Error('Événement introuvable.');
  }

  const isAlreadyParticipating = event.participants.includes(userId);

  const newParticipants = isAlreadyParticipating
    ? event.participants.filter((pId) => pId !== userId)
    : [...event.participants, userId];

  const updatedEvents = events.map((e) =>
    e.id === id ? { ...e, participants: newParticipants } : e
  );

  await saveEvents(updatedEvents);
}