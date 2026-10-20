# EventEase

Application mobile de l'association **EventEase** (Douai) : les membres et les bénévoles consultent les événements de l'association (conférences, ateliers, sorties), en créent de nouveaux et indiquent leur participation.

Prototype réalisé en 4 jours (du 19 au 22 octobre 2026) dans le cadre de la formation Concepteur Développeur d'Applications, à partir d'un cahier des charges.

## Fonctionnalités

**Obligatoires**
- Inscription et connexion, sans serveur : comptes enregistrés sur le téléphone, mots de passe hachés (SHA-256 + sel)
- Liste des événements (titre, date, description, nombre de participants), visible sans connexion
- Création, modification et suppression d'un événement (seul le créateur peut modifier ou supprimer)
- Participation à un événement (« Je participe ») et liste de mes participations dans le profil
- Données conservées sur le téléphone (AsyncStorage)

**Bonus**
- Calendrier des événements (`react-native-calendars`) : un point par jour, vert si je participe
- Météo prévue pour l'événement (API OpenWeather)
- Distance entre l'utilisateur et le lieu de l'événement (géolocalisation)
- Thème clair / sombre, choix mémorisé
- Icône, splash screen et icône dans les en-têtes

## Technologies

| Besoin | Choix |
|---|---|
| Application mobile | React Native avec Expo SDK 57, TypeScript |
| Navigation | Expo Router (construit sur React Navigation) : onglets et pile d'écrans |
| Stockage local | AsyncStorage |
| Sécurité des mots de passe | `expo-crypto` (SHA-256 + sel propre à chaque utilisateur) |
| Calendrier | `react-native-calendars` |
| Date et heure | `@react-native-community/datetimepicker` |
| Météo et géocodage | API OpenWeather (prévision gratuite sur 5 jours) |
| Géolocalisation | `expo-location` |

## Installation

Prérequis : Node.js, et l'application **Expo Go** sur le téléphone.

```bash
git clone https://github.com/bozzomarion59-coder/EventEase.git
cd EventEase
npm install
```

Créer à la racine un fichier **`.env.local`** avec une clé gratuite d'[OpenWeather](https://openweathermap.org/api) (ce fichier n'est pas envoyé sur GitHub) :

```
EXPO_PUBLIC_OPENWEATHER_API_KEY=votre_cle
```

Lancer l'application, puis scanner le QR code avec l'appareil photo (iPhone) ou Expo Go (Android) :

```bash
npx expo start
```

Au premier lancement, trois événements de démonstration sont chargés. Il suffit de créer un compte pour participer et créer des événements.

## Architecture

```
src/
├── app/          Écrans (Expo Router : chaque fichier est une page)
│   ├── (tabs)/   Onglets : Événements, Calendrier, Mon profil
│   ├── auth/     Connexion, inscription
│   └── event/    Détail d'un événement, formulaire de création / modification
├── services/     Accès aux données : storage.ts (stockage, joue le rôle de l'API), weather.ts (OpenWeather)
├── hooks/        Logique réutilisable des écrans : météo et distance d'un événement
├── contexts/     Session de l'utilisateur et thème, partagés par toute l'app
├── components/   Éléments d'interface partagés (titre des en-têtes)
├── constants/    Couleurs des thèmes clair et sombre
├── utils/        Petites fonctions : dates, distance, participation, annonces d'erreur
├── data/         Événements de démonstration
└── types.ts      Types partagés (utilisateur, événement)
```

## Limites du prototype

- **Pas de serveur** : chaque téléphone a ses propres comptes et événements.
- **Clé OpenWeather** : elle est incluse dans l'application installée. Dans une vraie application, c'est un serveur qui appellerait OpenWeather.
- **Météo** : disponible seulement 5 jours avant l'événement (limite de l'offre gratuite).
- **Distance** : à vol d'oiseau, pas par la route.
- **Icône et splash screen** : configurés dans `app.json`, mais visibles seulement dans une application installée, pas dans Expo Go.

## Suivi du projet

- [`SUIVI.md`](SUIVI.md) : planning, décisions et leurs raisons, journal jour par jour
- [`PROMPTS.md`](PROMPTS.md) : traçabilité de l'usage de l'intelligence artificielle

Une branche par fonctionnalité, fusionnée dans `main` par Pull Request après test sur iPhone.

## Autrice

Marion Bozzo
