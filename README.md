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

Sprint 1 – MVP
Objectif :
✅ créer une session
✅ générer le QR
✅ scanner le QR
✅ enregistrer une présence

C'est le premier jalon où l'application devient utilisable.

Sprint 2
Ajout de :
liste des apprenants
import CSV/Excel
tableau des présents en direct

Sprint 3
Ajout de :
connexion formateur
plusieurs organismes
plusieurs formations

Sprint 4
Ajout de :
export Excel
PDF d'émargement
statistiques


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