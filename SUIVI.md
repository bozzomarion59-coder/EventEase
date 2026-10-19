# Suivi du projet : EventEase

## Planning

| Jour | Date | Objectif | Statut |
|---|---|---|---|
| 1 | Lundi 19/10 | Projet Expo, écrans de base, navigation, connexion et inscription | En cours |
| 2 | Mardi 20/10 | CRUD des événements, « participé », persistance AsyncStorage | |
| 3 | Mercredi 21/10 | Bonus : calendrier, météo, thème, icône et splash | |
| 4 | Jeudi 22/10 | Gel à midi, tests sur iPhone, document technique, soutenance | |

## Décisions

| Date | Sujet | Décision | Raison |
|---|---|---|---|
| 19/10 | Dépôt | Dépôt GitHub privé, branche `main` | Un seul dépôt pour le code et le rendu |
| 19/10 | Branches | Une branche par fonctionnalité (`feat/...`, `fix/...`, `docs/...`), fusion dans `main` par Pull Request | Garder `main` toujours fonctionnel |
| 19/10 | Commits | Conventional Commits en français | Historique lisible et homogène |
| 19/10 | SDK Expo | SDK 57 | Version d'Expo Go sur mon iPhone |
| 19/10 | Navigation | Expo Router | Vu en cours (S1_J2). Construit sur React Navigation : respecte la contrainte du cahier des charges |
| 19/10 | Persistance | AsyncStorage | Demandé par le cahier des charges, vu en cours |
| 19/10 | Backend | Aucun : comptes, session et événements stockés sur le téléphone | Demandé par le cahier des charges. Limite : chaque téléphone a ses propres données |
| 19/10 | Écrans | Pas de « mot de passe oublié », accueil fusionné avec la liste des événements | Pas de backend pour envoyer un email. Un écran de moins à maintenir |
| 19/10 | Liste visible sans connexion | Un visiteur voit la liste et le détail. Il faut être connecté pour créer ou participer | Découvrir l'association avant de s'inscrire |
| 19/10 | Membres et bénévoles | Un statut « Membre » ou « Bénévole » choisi à l'inscription, affiché dans le profil. Mêmes droits pour tous | Le cahier des charges donne les mêmes actions aux deux. Un rôle ne sert que s'il change les droits |
| 19/10 | Rôle admin | Pas de rôle admin | Non demandé par le cahier des charges. Sans serveur, un admin ne gérerait que les données de son propre téléphone |
| 19/10 | Couche de données | Tous les accès aux données passent par `services/storage.ts` (comptes, session, événements, participation), qui joue le rôle de l'API | Les écrans ne savent pas où sont rangées les données. Passer à un vrai serveur = réécrire ce seul fichier en `fetch` |
| 19/10 | Données de démonstration | Un fichier `src/data/demo.ts` copié dans AsyncStorage au premier lancement, si le stockage est vide | L'app n'est pas vide pendant la démo. Le code installé sur le téléphone est en lecture seule : l'app ne peut pas réécrire un fichier du projet |
| 19/10 | Consentement | Case à cocher obligatoire à l'inscription : « J'accepte que mes données soient enregistrées sur ce téléphone » | Informer l'utilisateur de ce qui est conservé (RGPD) |
| 19/10 | Droits sur les événements | Seul le créateur d'un événement peut le modifier ou le supprimer. Tout membre connecté peut participer | Éviter qu'un membre modifie ou supprime l'événement d'un autre |
| 19/10 | Liste des écrans | Visiteur : liste des événements (accueil), détail, connexion, inscription. Membre connecté, en plus : participation depuis le détail, formulaire d'événement (création et modification), profil avec ses participations | Couvre toutes les fonctionnalités obligatoires du cahier des charges |
| 19/10 | Onglets | Événements et Profil (Calendrier ajouté mercredi). Pour un visiteur, l'onglet Profil propose de se connecter | Peu de sections : deux onglets suffisent. Mêmes onglets pour tout le monde |
| 19/10 | Branches conservées | Les branches restent sur GitHub après la fusion (`gh pr merge --merge`, sans `--delete-branch`) | Montrer au jury une branche par fonctionnalité, avec sa Pull Request |
| 19/10 | Lint | Configuration ESLint propre au projet (`eslint.config.js`, `eslint-config-expo`) | Sans elle, ESLint utilisait le fichier d'un autre projet trouvé dans le dossier personnel |
| 19/10 | Mots de passe | Hachés avec SHA-256 et un sel aléatoire propre à chaque utilisateur (`expo-crypto`). Jamais stockés en clair | bcryptjs a besoin d'un générateur aléatoire sûr qui n'existe pas sur le téléphone sans `expo-crypto`, et il ralentit la connexion. Limite : SHA-256 est moins robuste que bcrypt. Avec un vrai serveur, bcrypt côté serveur |
| 19/10 | Session | L'identifiant de l'utilisateur connecté est enregistré dans AsyncStorage, relu au démarrage, effacé à la déconnexion | Rester connecté en rouvrant l'app. Pas de token, donc pas de secret à chiffrer |

## Points à trancher

- Favoris : non demandés, à garder pour plus tard ?

## Journal

### Lundi 19/10
- Analyse du cahier des charges, planning sur 4 jours.
- Projet Expo créé (SDK 57), AsyncStorage installé, fichiers du modèle supprimés. Testé sur iPhone.
- Dépôt GitHub créé, premier commit poussé.
- Navigation en place et testée sur iPhone : onglets Événements et Profil, détail, formulaire, connexion, inscription. ESLint configuré pour le projet.
- Connexion et inscription terminées (Membre / Bénévole, consentement, mot de passe haché), testées sur iPhone : champs vides, consentement manquant, mot de passe trop court, email déjà utilisé, mauvais mot de passe, déconnexion, session conservée à la réouverture de l'app.
