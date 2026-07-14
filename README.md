Le projet : Presence360 (nom de travail)

Sprint 0 – Mise en place (1 soirée)
Objectif : obtenir une base saine.
Dépôt GitHub
gestion-presences/
Supabase
Projet créé
Base PostgreSQL
Tables créées
Render
API Node.js déployée
GitHub Pages
Frontend accessible

Nous utiliserons :
GitHub → code source
GitHub Pages → frontend
Render → API
Supabase → base de données
Visual Studio Code → développement local

LOGIQUE MÉTIER (très important)
- Une session :1 QR formateur, token sécurisé, durée limitée
- Un apprenant :QR permanent (Option A validée), pas de login : Une présence = session + apprenant + timestamp unique

SÉCURITÉ (MINIMUM VIABLE)
API publique Render
validation token côté backend
Supabase non exposé au frontend directement