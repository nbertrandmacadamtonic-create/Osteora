OSTÉO PRATIK — V5 FICHES TECHNIQUES DÉTAILLÉES

Cette version ajoute au back-office :
- source de la fiche
- catégorie
- méthode
- introduction
- toutes les étapes détaillées (Position, Position des mains, Barrière motrice, Normalisation, etc.)
- texte complet de chaque étape
- photo associée à chaque étape
- image principale
- planches / images supplémentaires
- aperçu des images
- ajout / suppression d'étapes
- import des fiches détaillées existantes depuis Ostéo RA

IMPORTANT
app.js et styles.css ne sont pas modifiés.
Le bridge lit les fiches détaillées existantes d'Ostéo RA et permet au back-office
de les importer dans Supabase. Une fois importées, les fiches modifiées dans le
back-office sont utilisées directement par l'application.

INSTALLATION GITHUB
Remplacer / ajouter à la racine :
- backoffice.html
- backoffice.css
- backoffice.js
- backoffice-bridge.js
- responsive-web.css
- supabase-config.js

L'index.html actuel reste inchangé et doit déjà contenir :
<script src="backoffice-bridge.js"></script>
juste avant </body>.

APRÈS DÉPLOIEMENT
1. Ouvrir backoffice.html.
2. Vous êtes normalement déjà connecté à Supabase.
3. Cliquer une fois sur :
   « Importer / actualiser les fiches détaillées depuis Ostéo RA »
4. Sélectionner une technique.
5. Les zones de la fiche détaillée deviennent éditables.
6. Enregistrer dans Supabase.

IMAGES
Les champs images enregistrent des chemins/URL. Les fichiers image eux-mêmes doivent
rester accessibles depuis GitHub (assets/...) ou une URL publique. Cette version
n'envoie pas encore les fichiers binaires dans Supabase Storage.
