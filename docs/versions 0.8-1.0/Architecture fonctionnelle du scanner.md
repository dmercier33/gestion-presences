Architecture comportementale du scanner
Objectif

Le scanner est le point d'entrée opérationnel de l'émargement.

Son rôle est de transformer la lecture d'un QR Code apprenant en une demande de validation auprès du moteur métier Presencia.

Le scanner ne prend jamais de décision concernant l'émargement.

Il ne valide jamais seul une présence.

Principe général

Le scanner fonctionne comme une machine à états.

Son comportement repose sur deux éléments :

une session active d'émargement ;
la lecture des QR Codes apprenants.

Le scanner doit toujours connaître le contexte métier avant de permettre un scan apprenant.

Cycle nominal :

Initialisation
       ↓
Validation session active
       ↓
Scanner un apprenant
       ↓
Transmission
       ↓
Validation métier
       ↓
Résultat
       ↓
Retour attente

Le comportement du scanner est entièrement déterministe : pour une même réponse du backend, il affichera toujours le même résultat.

Principe de gestion de session

La session active est un contexte nécessaire au fonctionnement du scanner.

Elle est représentée localement par :

activeSessionId

Cette information permet au scanner de fonctionner sans imposer au formateur un scan systématique du QR Séance.

Cependant :

activeSessionId n'est jamais considéré comme une source de vérité métier.

Règle d'architecture :

Backend = source de vérité

Frontend = interface utilisateur

localStorage = cache temporaire

Au démarrage du scanner :

une session locale existante peut être utilisée ;
elle doit être validée par le moteur métier ;
une session invalide ou expirée est supprimée.
Responsabilités
Le scanner

Le scanner est responsable de :

initialiser son contexte de session ;
vérifier qu'une session active exploitable existe ;
lire un QR Code ;
identifier son type ;
transmettre les informations au backend ;
afficher le résultat retourné ;
revenir automatiquement à l'état d'attente.

Le scanner ne décide jamais :

si une présence est valide ;
si une séance est ouverte ;
si un apprenant est attendu ;
si une présence existe déjà.
Le moteur métier Presencia

Le backend est responsable de toutes les règles métier.

Il vérifie notamment :

l'existence de la séance ;
son état ;
sa validité temporelle ;
l'existence de l'apprenant ;
son appartenance aux participants attendus ;
l'absence de présence déjà enregistrée.

Le backend est le seul composant autorisé à créer une présence.

États du scanner
S0 — Initialisation

Le scanner démarre.

Il recherche une session active exploitable.

Messages possibles :

Recherche de la session active...
S1 — Session prête

Une session active valide est disponible.

Le scanner passe en mode opérationnel.

Message :

🟢 Session active OK

📷 Scanner un apprenant
S2 — Lecture QR

Le QR Code est détecté.

Le scanner décode son contenu.

Aucune décision métier n'est encore prise.

S3 — Identification

Le scanner identifie la nature du QR Code.

Deux possibilités :

QR Séance ;
QR Apprenant.

Le QR Séance reste disponible comme mécanisme alternatif de sélection de session.

S4 — Transmission

Le scanner transmet les informations au backend.

Pour un QR Apprenant :

activeSessionId
        +
qrCode apprenant
        ↓
demande de validation présence
S5 — Validation métier

Le backend applique les règles de Presencia.

Réponses possibles :

Présence enregistrée ;
Présence déjà enregistrée ;
Apprenant non prévu ;
Badge non reconnu ;
Séance terminée ;
Erreur.

Toutes les décisions métier sont prises à cette étape.

S6 — Affichage

Le scanner présente un message orienté métier.

Exemples :

✅ Présence enregistrée

ℹ️ Présence déjà enregistrée

⚠️ Apprenant non prévu

❌ Badge non reconnu

Les messages techniques ne sont jamais affichés.

S7 — Retour attente

Après affichage :

l'état courant est libéré ;
le scanner est prêt pour un nouvel apprenant.

Le cycle recommence.

Représentation de la machine à états
+----------------------+
| S0 Initialisation    |
+----------------------+
           |
           ↓
Validation session active
           |
           ↓
+----------------------+
| S1 Session prête     |
+----------------------+
           |
           ↓
"Scanner un apprenant"
           |
           ↓
+----------------------+
| S2 Lecture QR        |
+----------------------+
           |
           ↓
+----------------------+
| S3 Identification    |
+----------------------+
           |
           ↓
+----------------------+
| S4 Transmission      |
+----------------------+
           |
           ↓
+----------------------+
| S5 Validation métier |
+----------------------+
           |
           ↓
+----------------------+
| S6 Affichage         |
+----------------------+
           |
           ↓
Retour S1
Conséquences architecturales

Cette architecture présente plusieurs avantages :

une seule source de vérité pour les règles métier ;
suppression des incohérences liées aux anciennes sessions locales ;
meilleure expérience formateur ;
suppression du QR Séance obligatoire dans le workflow nominal ;
comportement prévisible du scanner ;
facilité de maintenance ;
possibilité de remplacer le scanner Web par une application mobile sans modifier les règles métier.
Principe d'architecture A1
Le scanner ne décide jamais.
Presencia décide.

Le scanner :

connaît le contexte ;
lit ;
transmet ;
informe.

Le moteur métier :

contrôle ;
valide ;
crée la présence.