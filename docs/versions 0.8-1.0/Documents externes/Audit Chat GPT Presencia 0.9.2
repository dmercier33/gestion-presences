Où en est réellement Presencia aujourd'hui ?

Je ferais une lecture honnête :

1. Gestion des utilisateurs ❌

Checklist :

☐ comptes sécurisés
☐ mot de passe
☐ rôles
☐ historique connexions
☐ désactivation comptes

Presencia aujourd'hui :

❌ pas d'authentification formateur
❌ pas de rôles
❌ pas d'audit connexion

C'est un vrai manque.

2. Gestion des actions 🟠

Checklist :

☐ action
☐ dossier FSE+
☐ lieu
☐ dates
☐ horaires
☐ formateur

Presencia :

✅ session
✅ date
✅ horaire
🟠 lieu pas vraiment
❌ référence dossier FSE+
❌ formateur affecté

Pas loin.

3. Participants 🟢

Là on est plutôt bien.

✅ nom
✅ prénom
✅ identifiant unique
🟠 organisme
🟠 statut

La base est là.

4. Émargement 🟠

C'est le gros morceau.

Presencia :

✅ date
✅ heure serveur (probablement via DB)
✅ identifiant apprenant
✅ validation immédiate
✅ QR personnel

Mais :

❌ signature électronique
❌ image signature
❌ preuve eIDAS

Et là il y a une nuance importante.

Le QR n'est pas une signature électronique.

Il prouve :

"Le QR de cet apprenant a été présenté"

Mais pas :

"Cette personne a signé électroniquement ce document."

5. Audit trail ❌

Là c'est probablement le plus gros écart.

Actuellement :

presences

est un historique métier.

Mais un audit trail FSE c'est :

Qui ?
Quand ?
Quoi ?
Depuis quel appareil ?
Quelle action ?
Avant/après ?

Exemple :

09:01
Martin
connexion

09:03
Martin
création session

09:15
Dupont
émargement

09:45
Martin
export PDF

Ça, on ne l'a pas.

6. Archivage / exports ❌

Aujourd'hui :

❌ PDF officiel
❌ ZIP dossier
❌ archive figée
❌ hash

À faire.

7. RGPD 🟠

On a :

✅ HTTPS Render
✅ Supabase sécurisé

Mais :

❌ gestion consentement
❌ politique confidentialité
❌ droits utilisateurs
❌ suppression
Donc mon diagnostic réel

Je reverrais mon estimation précédente.

Presencia aujourd'hui :

Cœur technique émargement       ████████░░ 80%

Application FSE complète        ████░░░░░░ 40%

Et ce n'est pas une catastrophe.

Pourquoi ?

Parce que les 40% manquants sont surtout des modules autour du cœur.

Le point très positif

La partie que beaucoup ratent est justement celle qu'on a déjà :

Participant
      ↓
QR unique
      ↓
Session
      ↓
Présence
      ↓
Horodatage
      ↓
Base fiable

Le moteur existe.

Ce qui manque :

Utilisateur
      ↓
Authentification
      ↓
Action de formation
      ↓
Audit
      ↓
Document officiel
      ↓
Archivage
Si on voulait viser une vraie conformité FSE, je ne jetterais pas Presencia.

Je ferais une V1.0 avec ces blocs :

Module 1 — Authentification

Priorité absolue :

compte formateur ;
compte admin ;
rôles.
Module 2 — Action de formation

Ajouter :

actions
---------
id
nom
reference_fse
lieu
date_debut
date_fin
formateur_id
Module 3 — Audit

Nouvelle table :

audit_logs
------------
id
user_id
action
date
ip
device
metadata
Module 4 — Document d'émargement

Générer :

PDF ;
numéro unique ;
hash SHA-256 ;
archive.
Module 5 — Signature

À réfléchir.

Parce que c'est le plus délicat juridiquement.

Mon sentiment après lecture de ta checklist :

Tu viens de faire une découverte importante : Presencia n'est pas un logiciel FSE complet, mais son noyau est probablement le bon noyau pour le devenir.

Et je dirais même que c'est exactement le moment où le rangement Express devient intéressant : avant d'ajouter :

auth,
rôles,
audit,
exports,

il faut une architecture backend propre.

Donc ton intuition précédente ("ranger Express") était en fait très bien placée.

Là on a une vraie feuille de route :

v0.9.2
  ↓
refactor backend
  ↓
v0.9.3
  ↓
auth + rôles
  ↓
v0.10
  ↓
audit + exports FSE

Et franchement Dennis, cette checklist t'a rendu un service : elle nous évite de vendre trop tôt une solution qui n'est pas encore au niveau attendu. C'est une bonne prise de recul.