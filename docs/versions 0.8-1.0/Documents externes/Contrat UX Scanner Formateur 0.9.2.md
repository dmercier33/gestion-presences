Contrat UX Scanner Formateur — Presencia
Version V0.9.2 — Base stable avant évolutions métier
Objectif du document

Définir le comportement attendu du scanner formateur afin de garantir une expérience utilisateur cohérente.

Ce document décrit :

les états du scanner ;
les messages affichés au formateur ;
les règles de présentation des résultats ;
la séparation entre interface et logique métier.
1. Principes fondamentaux
Principe 1 — Le scanner ne décide jamais du métier

Le scanner est responsable uniquement de :

lire un QR Code ;
transmettre les informations au moteur métier ;
afficher le résultat retourné.

La décision appartient au backend Presencia.

Architecture :

Scanner frontend
        |
        | QR apprenant / QR séance
        ↓
API Presencia
        |
        | Validation métier
        ↓
Résultat utilisateur

Le frontend ne doit jamais contenir une règle métier critique.

Exemples de règles backend :

l'apprenant existe ;
la séance existe ;
la séance est active ;
l'apprenant est attendu ;
la présence n'existe pas déjà.
Principe 2 — Aucun message technique visible

Le formateur ne doit jamais voir :

erreur SQL ;
erreur API brute ;
message JavaScript ;
nom de variable ;
identifiant technique inutile.

Interdit :

Already registered
Session not found
Missing sessionId

Remplacé par :

ℹ️ Présence déjà enregistrée

❌ Séance inconnue

⚠️ Séance non sélectionnée
Principe 3 — Chaque message doit répondre à deux questions

Le message doit indiquer :

Ce qui vient de se passer ;
Ce que l'utilisateur doit faire maintenant.
2. Hiérarchie des informations affichées

Lorsqu'un résultat est affiché, l'ordre de priorité est :

Niveau 1 — Résultat métier

Exemple :

✅ Présence enregistrée
Niveau 2 — Personne concernée

Exemple :

Denis Mercier
Niveau 3 — Action suivante

Exemple :

Scannez l'apprenant suivant
Niveau 4 — Informations techniques

Réservées :

console développeur ;
logs ;
diagnostic.

Jamais affichées dans l'interface formateur.

3. Responsabilité des états du scanner
S0 — Scanner prêt
Situation

Le scanner est démarré et attend un QR.

Affichage
📷 Scanner prêt

Présentez le QR apprenant

ou selon le mode actif :

📷 Scanner prêt

Présentez le QR séance
S1 — Séance reconnue
Situation

Le QR séance a été lu et validé.

Affichage
✅ Séance ouverte

Groupe FLE G1

Scannez les apprenants

Informations possibles :

nom de la séance ;
groupe ;
horaires.
S2 — Apprenant reconnu
Situation

Le QR apprenant est valide.

Affichage
👤 Denis Mercier

Vérification en cours...

À ce stade :

Aucune présence n'est encore créée.

S3 — Présence validée
Situation

La validation métier est positive.

Affichage
✅ Présence enregistrée

Denis Mercier

14:39

Informations complémentaires possibles :

Présents : 12 / 18

(fonctionnalité future)

4. Cas d'erreurs métier
E1 — Présence déjà enregistrée
Situation

Une présence existe déjà :

session_id + apprenant_id
Message
ℹ️ Présence déjà enregistrée

Denis Mercier

a déjà émargé cette séance
Action

Continuer le scan.

E2 — QR inconnu
Situation

Le QR ne correspond à aucun apprenant connu.

Message
❌ Badge non reconnu

Vérifiez le QR apprenant
Action

Contrôler le badge présenté.

E3 — Apprenant non prévu
Situation

L'apprenant existe mais n'appartient pas à :

session_apprenants
Message
⚠️ Apprenant non prévu

Cet apprenant n'est pas inscrit
à cette séance
Action

Vérifier :

le groupe ;
l'inscription ;
la séance.
E4 — Séance absente
Situation

Aucune séance sélectionnée.

Message
⚠️ Séance non sélectionnée

Scannez d'abord le QR séance
E5 — Séance terminée
Situation

La séance n'est plus active.

Message
⏰ Séance terminée

Ouvrez une nouvelle séance
E6 — Service indisponible
Situation

Le backend ou la base ne répond pas.

Message
❌ Service momentanément indisponible

La présence n'a pas été enregistrée.

Réessayez.
5. Cas techniques visibles
Caméra refusée
Situation

Le navigateur refuse l'accès caméra.

Message
📷 Caméra inaccessible

Autorisez l'accès caméra
dans votre navigateur
6. Informations après validation

Priorité :

Prénom + nom ;
Résultat ;
Heure ;
Groupe ;
Informations complémentaires.

Exemple :

✅ Présence enregistrée

Denis Mercier

Groupe FLE G1

14:39
7. Règles métier garanties par le backend

Le scanner ne fait confiance qu'au résultat API.

Le backend garantit :

Présence unique
UNIQUE(session_id, apprenant_id)
Participant unique
UNIQUE(session_id, apprenant_id)

dans :

session_apprenants
8. Hors périmètre V0.9.2

Non inclus :

❌ authentification utilisateur
❌ application mobile native
❌ historique complet utilisateur
❌ statistiques
❌ audit trail complet
❌ signature électronique
❌ export officiel FSE

Ces éléments appartiennent à une évolution conformité future.

9. Évolutions prévues
Authentification

Ajouter :

formateur ;
administrateur ;
rôles.
Audit

Tracer :

connexion ;
création séance ;
scan ;
export ;
modification.
Documents

Prévoir :

PDF émargement ;
export CSV ;
archivage.
Signature électronique

À étudier selon le niveau de preuve attendu.

État du contrat UX
Presencia v0.9.2

Scanner :
✅ lecture QR
✅ transmission backend
✅ affichage métier

Backend :
✅ validation règles métier
✅ protection doublons

Interface :
✅ messages orientés utilisateur
✅ absence d'erreurs techniques visibles