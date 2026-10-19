// Toutes les données de l'app passent par ce fichier (il joue le rôle de l'API)
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Les clés sous lesquelles les données sont rangées dans AsyncStorage
const USERS_KEY = 'users';
const SESSION_KEY = 'session';

// Lit la liste des comptes enregistrés sur le téléphone
async function getUsers(): Promise<User[]> {
  const json = await AsyncStorage.getItem(USERS_KEY); // le texte enregistré, ou null
  return json ? JSON.parse(json) : []; // pas encore de comptes : liste vide
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
  // 1. Nettoyer l'email : enlever les espaces, tout en minuscules
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // 2. Vérifier : nom non vide, email qui contient @, mot de passe de 8 caractères minimum
  if (!cleanName) {
    throw new Error('Le nom ne peut pas être vide.');
  }
  if (!cleanEmail.includes('@')) {
    throw new Error('L’adresse e-mail n’est pas valide.');
  }
  if (password.length < 8) {
    throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
  }

  // 3. Lire les comptes ; si un compte a déjà cet email → throw new Error
  const users = await getUsers();
  const emailExists = users.some((u) => u.email === cleanEmail);
  if (emailExists) {
    throw new Error('Cette adresse e-mail est déjà utilisée.');
  }

  // 4. Créer le sel avec Crypto.randomUUID(), puis le hash avec hashPassword
  const salt = Crypto.randomUUID();
  const passwordHash = await hashPassword(password, salt);

  // 5. Construire le nouvel utilisateur (id : Crypto.randomUUID() aussi)
  const newUser: User = {
    id: Crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    statut,
    passwordHash,
    salt,
  };

  // 6. Enregistrer la liste avec le nouveau compte
  await saveUsers([...users, newUser]);

  // Enregistrement de la session pour connecter automatiquement l'utilisateur après l'inscription
  await AsyncStorage.setItem(SESSION_KEY, newUser.id);

  return newUser;
}

// Connecte un utilisateur. Lance une erreur générique si l'email ou le mot de passe est incorrect.
export async function loginUser(email: string, password: string): Promise<User> {
  // 1. Nettoyer l'email
  const cleanEmail = email.trim().toLowerCase();

  // 2. Chercher le compte correspondant
  const users = await getUsers();
  const user = users.find((u) => u.email === cleanEmail);

  // 3. S'il n'existe pas, erreur générique (sécurité)
  if (!user) {
    throw new Error('Email ou mot de passe incorrect.');
  }

  // 4. Hacher le mot de passe soumis avec le sel du compte trouvé
  const inputHash = await hashPassword(password, user.salt);

  // 5. Si le hash ne correspond pas, même erreur générique
  if (inputHash !== user.passwordHash) {
    throw new Error('Email ou mot de passe incorrect.');
  }

  // 6. Enregistrer l'ID utilisateur en session et renvoyer le profil complet
  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return user;
}

// Récupère l'utilisateur actuellement connecté au démarrage
export async function getSessionUser(): Promise<User | null> {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  if (!userId) {
    return null;
  }

  const users = await getUsers();
  const currentUser = users.find((u) => u.id === userId);
  
  return currentUser || null;
}

// Déconnecte l'utilisateur en effaçant sa session
export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}