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
