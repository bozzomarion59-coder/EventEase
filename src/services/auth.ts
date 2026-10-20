// Comptes et session, enregistrés sur le téléphone (ce fichier joue le rôle de l'API d'authentification)
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Les clés sous lesquelles les données sont rangées dans AsyncStorage
const USERS_KEY = 'users';
const SESSION_KEY = 'session';

// Lit la liste des comptes enregistrés sur le téléphone
async function getUsers(): Promise<User[]> {
  const json = await AsyncStorage.getItem(USERS_KEY);
  return json ? JSON.parse(json) : [];
}

// Enregistre la liste des comptes sur le téléphone
async function saveUsers(users: User[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Hache le mot de passe avec le sel de l'utilisateur (SHA-256)
async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);
}

// Crée un compte et ouvre la session. Lance une erreur si les données sont invalides ou si l'email est déjà pris
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
  if (users.some((u) => u.email === cleanEmail)) throw new Error('Cette adresse e-mail est déjà utilisée.');

  const salt = Crypto.randomUUID();
  const newUser: User = {
    id: Crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    statut,
    passwordHash: await hashPassword(password, salt),
    salt,
  };

  await saveUsers([...users, newUser]);
  await AsyncStorage.setItem(SESSION_KEY, newUser.id);
  return newUser;
}

// Connecte un utilisateur. Message d'erreur identique dans les deux cas : on ne révèle pas si l'email existe
export async function loginUser(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const user = (await getUsers()).find((u) => u.email === cleanEmail);

  if (!user) throw new Error('Email ou mot de passe incorrect.');
  if ((await hashPassword(password, user.salt)) !== user.passwordHash) {
    throw new Error('Email ou mot de passe incorrect.');
  }

  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return user;
}

// Récupère l'utilisateur connecté au démarrage de l'app (null si personne)
export async function getSessionUser(): Promise<User | null> {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  return (await getUsers()).find((u) => u.id === userId) ?? null;
}

// Déconnecte l'utilisateur en effaçant sa session
export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// Renvoie seulement le nom et le statut d'un membre (jamais son email ni son mot de passe haché)
export async function getMemberInfo(id: string): Promise<Pick<User, 'name' | 'statut'> | null> {
  const user = (await getUsers()).find((u) => u.id === id);
  return user ? { name: user.name, statut: user.statut } : null;
}
