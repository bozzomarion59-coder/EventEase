// Types partagés par toute l'application

// Un compte utilisateur, tel qu'il est enregistré sur le téléphone
export type User = {
  id: string;           // identifiant unique, généré à l'inscription
  name: string;         // nom affiché dans l'app
  email: string;        // sert à se connecter
  statut: 'membre' | 'benevole'; // affiché dans le profil, mêmes droits pour les deux
  passwordHash: string; // mot de passe haché (jamais le mot de passe en clair)
  salt: string;         // sel propre à cet utilisateur
};

// Un événement créé dans l'application
export type Event = {
  id: string;           // identifiant unique, généré à la création
  title: string;        // titre de l'événement
  description: string;  // description
  date: string;         // date et heure au format ISO (ex. "2026-10-24T14:00:00.000Z")
  location?: string;    // ville de l'événement (ex. "Douai"), absente sur les anciens événements
  latitude?: number;    // coordonnées de la ville, trouvées par OpenWeather à l'enregistrement
  longitude?: number;
  createdBy: string;    // id du créateur : lui seul peut modifier ou supprimer
  participants: string[]; // id des membres qui participent
};