OSTÉO PRATIK — BACK-OFFICE CENTRAL V4

OBJECTIF
Toute modification faite dans le back-office est stockée dans Supabase.
Tous les téléphones, tablettes et ordinateurs lisent ensuite la même base.

CE QUI RESTE INTACT
- app.js
- styles.css
- la structure et la navigation Ostéo RA
- votre index.html garde seulement :
  <script src="backoffice-bridge.js"></script>
  juste avant </body>.

FICHIERS À METTRE À LA RACINE GITHUB
- backoffice.html
- backoffice.css
- backoffice.js
- backoffice-bridge.js
- responsive-web.css
- supabase-config.js

INSTALLATION SUPABASE
1. Créer un projet Supabase.
2. Exécuter le fichier supabase-schema.sql dans l'éditeur SQL.
3. Créer votre utilisateur administrateur dans Supabase Auth.
4. Ouvrir supabase-config.js et remplacer :
   - VOTRE-PROJET par la Project URL
   - VOTRE_CLE_PUBLIQUE_ANON_OU_PUBLISHABLE par la clé PUBLIQUE anon/publishable.
   Ne jamais utiliser une clé service_role.
5. Envoyer les fichiers à la racine du dépôt GitHub.
6. Ouvrir backoffice.html.
7. Se connecter avec l'utilisateur administrateur.
8. La première fois seulement, cliquer :
   "Initialiser la base depuis Ostéo RA".
9. Ensuite, toute modification enregistrée devient commune à tous les appareils.

SÉCURITÉ
- Lecture publique des techniques.
- Modification/suppression uniquement pour un utilisateur Supabase authentifié.
- La clé publique peut être présente dans un site web ; les droits sont protégés par RLS.
- Ne jamais publier une clé service_role ou une clé secrète.
