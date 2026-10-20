# Suivi du projet : EventEase

## Planning

| Jour | Date | Objectif | Statut |
|---|---|---|---|
| 1 | Lundi 19/10 | Projet Expo, écrans de base, navigation, connexion et inscription | Terminé |
| 2 | Mardi 20/10 | CRUD des événements, « participé », persistance AsyncStorage | Terminé (avancé lundi après-midi, testé mardi matin) |
| 3 | Mercredi 21/10 | Bonus : calendrier, météo, thème, icône et splash | Thème clair / sombre fait mardi |
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
| 19/10 | Organisation des routes | Onglets dans le groupe `(tabs)/`, écrans publics dans `auth/`, détail en route dynamique `event/[id].tsx`, un seul formulaire `event/form.tsx` (création sans `id`, modification avec `?id=`) | Le groupe `(tabs)` rend les onglets accessibles sans connexion. Un seul fichier pour tous les détails et un seul formulaire pour créer et modifier |
| 19/10 | Retour après connexion / inscription | Connexion : retour à l'écran précédent (`router.back()`). Inscription : fermeture de tous les écrans ouverts par-dessus les onglets (`router.dismissAll()`) | Pas de rôle, donc pas de redirection par rôle. Après l'inscription, un simple retour ramènerait à l'écran de connexion |
| 19/10 | Accessibilité | Zones tactiles de 48 px minimum (`minHeight`), libellés VoiceOver sur les champs, boutons et onglets, erreurs annoncées après une seconde, apostrophe typographique `’` dans les textes | Sur iPhone, une annonce faite pendant la mise à jour de l'écran est annulée. L'apostrophe droite est refusée par le lint dans le JSX |
| 19/10 | Couleurs | Écrites en dur dans chaque écran, identiques partout (bleu `#0056B3`, erreur `#B00020`, fond `#F2F2F2`) | Le thème clair / sombre est prévu mercredi : elles passeront alors dans un seul fichier |
| 20/10 | Ordre des bonus | Thème clair / sombre d'abord, puis calendrier (`react-native-calendars`, imposé par le cahier des charges) | Le thème touche tous les écrans : le faire avant évite de reprendre l'écran Calendrier ensuite |
| 20/10 | Thème clair / sombre | Couleurs dans `src/constants/colors.ts` (une palette claire, une sombre), `ThemeContext` qui donne `useTheme()` aux écrans, styles calculés par `makeStyles(colors)` dans chaque écran | Même organisation que mon projet précédent. Une couleur se change à un seul endroit |
| 20/10 | Choix du thème | Au premier lancement, thème du téléphone. Ensuite, interrupteur « Mode sombre » dans le Profil (visiteurs compris), choix mémorisé dans AsyncStorage | L'utilisateur garde son choix en rouvrant l'app |
| 20/10 | Contrastes du thème | Thème clair : couleurs déjà utilisées dans les écrans. Thème sombre : bleu éclairci avec texte foncé dessus (`onPrimary`). Fonds de badge ajoutés (`accent`, `successBackground`), contrastes calculés (5,4:1 minimum) | Respecter WCAG AA (4,5:1 pour le texte, 3:1 pour les bordures) dans les deux thèmes |
| 20/10 | Sélecteur de date | `themeVariant={mode}` au lieu de `"light"` | Le sélecteur suit le thème de l'app, pas celui du téléphone |
| 19/10 | Participation | Chaque événement garde la liste des identifiants de ses participants (`participants: string[]`). « Je participe » ajoute ou retire l'utilisateur de cette liste | Un seul endroit à lire pour afficher le nombre de participants et savoir si je participe |
| 19/10 | Format des dates | Dates enregistrées au format ISO, affichées en français par une seule fonction `formatEventDate` (`src/utils/date.ts`) | Le format ISO se trie et se relit sans ambiguïté. Une seule fonction pour que l'affichage soit le même partout (liste, détail, profil) |
| 19/10 | Sélecteur de date | `@react-native-community/datetimepicker`, installé avec `npx expo install`. iPhone : un sélecteur date + heure. Android : deux boutons, un pour la date et un pour l'heure. Dates passées interdites | Inclus dans Expo Go, donc pas besoin de build de développement. Android n'a pas de mode « date + heure » |
| 19/10 | Sélecteur en mode sombre | `themeVariant="light"` sur le sélecteur iPhone | L'app est en couleurs claires : sur un iPhone en mode sombre, le texte du sélecteur était gris clair sur fond blanc, illisible. À revoir avec le thème sombre mercredi |
| 19/10 | Nom du créateur | `getMemberInfo` ne renvoie que le nom et le statut d'un membre, jamais son email ni son mot de passe haché | N'afficher que les données utiles (minimisation, RGPD) |
| 19/10 | Rechargement des écrans | `useFocusEffect` sur la liste, le détail et le profil | Les données sont relues à chaque retour sur l'écran : une modification ou une participation apparaît sans relancer l'app |
| 19/10 | Suppression | Confirmation avant de supprimer un événement (`Alert.alert`, « Cette action est définitive ») | Éviter une suppression par erreur |

## Points à trancher

- Favoris : non demandés, à garder pour plus tard ?

## Journal

### Lundi 19/10
- Analyse du cahier des charges, planning sur 4 jours.
- Projet Expo créé (SDK 57), AsyncStorage installé, fichiers du modèle supprimés. Testé sur iPhone.
- Dépôt GitHub créé, premier commit poussé. Première Pull Request (`docs/suivi`).
- Template GitHub de 2016 trouvé, écarté après analyse (API retirées de React Native, composants en classe).
- Navigation en place et testée sur iPhone : onglets Événements et Profil, détail, formulaire, connexion, inscription. ESLint configuré pour le projet.
- Branches `docs/suivi` et `feat/navigation` restaurées sur GitHub après leur suppression : les branches sont désormais conservées.
- Erreur « Cannot find native module 'ExpoAsset' » au lancement : projet vérifié sain (`expo install --check`, `expo-doctor`), résolue en relançant le serveur avec `-c` et en rouvrant Expo Go.
- Connexion et inscription terminées (Membre / Bénévole, consentement, mot de passe haché), testées sur iPhone : champs vides, consentement manquant, mot de passe trop court, email déjà utilisé, mauvais mot de passe, déconnexion, session conservée à la réouverture de l'app.
- Événements et participation ajoutés à `storage.ts`, avec des données de démo au premier lancement. Sélecteur de date installé.
- Liste, détail (Je participe, Modifier / Supprimer pour le créateur), formulaire de création et de modification, « Mes participations » dans le Profil.
- PDF d'explication du code préparé pour la soutenance (`EventEase - explication du code.pdf`).

### Mardi 20/10
- « Mes participations » testé sur iPhone : sans participation, après « Je participe », après l'annulation, et en appuyant sur une ligne (ouvre le détail). Lint et typecheck sans erreur.
- PR #5 (`feat/evenements-crud`) créée et fusionnée par moi dans le terminal. Branche conservée.
- Erreur « Tried to register two views with the same name RNDateTimePicker » après `git pull`. Cause : le rechargement à chaud a renvoyé le module du sélecteur alors que l'app tournait déjà. Résolue en fermant puis en rouvrant Expo Go.
- Thème clair / sombre (branche `feat/theme`) : palettes, `ThemeContext`, en-têtes, onglets et 6 écrans convertis, interrupteur dans le Profil. Testé sur iPhone dans les deux thèmes, choix conservé après fermeture de l'app.
- Interrupteur « Mode sombre » décalé vers le haut : sur iPhone, `Switch` s'applique `alignSelf: 'flex-start'` (code de React Native). Corrigé avec `alignSelf: 'center'`.
- Le bouton ⚙️ en haut à droite des captures est celui d'Expo Go, pas de l'app.
