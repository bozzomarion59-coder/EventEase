# EventEase · Document technique

*Architecture et choix techniques · Marion Bozzo · CDA · octobre 2026*

EventEase permet aux membres et aux bénévoles d'une association de consulter, créer et rejoindre des événements. L'application est développée en React Native avec Expo et TypeScript, puis testée sur iPhone. La navigation repose sur Expo Router, construit sur React Navigation : chaque écran correspond à un fichier. Il n'y a pas de serveur : toutes les données restent dans la mémoire du téléphone, grâce à AsyncStorage. Le code est découpé en couches. Les écrans affichent l'information, mais ne touchent jamais directement aux données. Ils passent par des services, qui jouent le rôle d'une API. Brancher un vrai serveur ne modifierait donc que ces services. Les mots de passe ne sont jamais enregistrés en clair, et seul l'auteur d'un événement peut le modifier. Plusieurs bonus enrichissent l'application : un calendrier, la météo prévue grâce à l'API OpenWeather et la distance calculée par le GPS. Un thème clair et sombre rend enfin l'interface agréable et lisible pour tous. Ce prototype a ses limites : les données ne sont pas partagées entre téléphones et la météo n'est connue que cinq jours à l'avance.

Version PDF : [EventEase-Document-technique.pdf](EventEase-Document-technique.pdf) · Diaporama de soutenance : [EventEase-Soutenance.pdf](EventEase-Soutenance.pdf)
