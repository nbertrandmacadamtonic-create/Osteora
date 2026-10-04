OSTÉO PRATIK — V6 · FICHES DÉTAILLÉES + SUPABASE STORAGE

Cette version conserve la V5 et ajoute le téléversement direct des images vers Supabase Storage.

CE QUE VOUS POUVEZ MAINTENANT TÉLÉVERSER
- l’image principale d’une technique
- la photo associée à chaque étape de la fiche détaillée
- plusieurs images / planches associées à une technique

Les anciennes images déjà hébergées sur GitHub restent utilisables.

ÉTAPE 1 — ACTIVER STORAGE DANS SUPABASE
Dans Supabase :
SQL Editor > New query
Copiez tout le contenu de :
  supabase-storage.sql
puis cliquez sur Run.

Le script crée un bucket public :
  osteo-pratik-images

Lecture : publique, pour que les images s’affichent dans l’application.
Écriture : réservée aux utilisateurs Supabase authentifiés.

ÉTAPE 2 — METTRE LA V6 SUR GITHUB
Remplacez :
- backoffice.html
- backoffice.css
- backoffice.js

Le fichier backoffice-bridge.js de ce pack peut aussi remplacer l’ancien, mais il ne modifie toujours ni app.js ni styles.css.

Conservez votre supabase-config.js déjà configuré. Le pack contient le même fichier configuré.

UTILISATION
1. Ouvrez le back-office et connectez-vous.
2. Sélectionnez une technique.
3. Utilisez les boutons « Téléverser » pour choisir une image sur l’ordinateur.
4. L’image est envoyée dans Supabase Storage et son URL publique est placée dans la fiche.
5. Cliquez ensuite sur « Enregistrer dans Supabase » pour enregistrer cette URL dans la technique.

IMPORTANT
Retirer une image d’une fiche retire seulement sa référence dans la fiche. Le fichier physique n’est pas supprimé automatiquement du Storage, afin d’éviter une suppression accidentelle.

AUCUNE MODIFICATION DE LA STRUCTURE OSTÉO RA
- app.js : inchangé
- styles.css : inchangé
- navigation : inchangée
