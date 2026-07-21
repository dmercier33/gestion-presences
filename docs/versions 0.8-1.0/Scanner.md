Architecture comportementale du scanner
Objectif

Le scanner est le point d'entrée de l'émargement.

Son rôle est de transformer la lecture d'un QR Code en une demande de validation auprès du moteur métier Presencia.

Il ne prend jamais de décision concernant l'émargement.

Principe général

Le scanner fonctionne comme une machine à états.

Chaque QR Code présenté suit toujours le même cycle de traitement.

Lecture du QR
       ↓
Identification
       ↓
Transmission
       ↓
Validation métier
       ↓
Résultat
       ↓
Retour en attente

Le comportement du scanner est entièrement déterministe : pour une même réponse du backend, il affichera toujours le même résultat.

Responsabilités
Le scanner

Le scanner est responsable de :

lire un QR Code ;
identifier son type (Séance ou Apprenant) ;
transmettre les informations au backend ;
afficher le résultat retourné ;
revenir automatiquement à l'état d'attente.

Le scanner ne décide jamais :

si une présence est valide ;
si une séance est active ;
si un apprenant est attendu ;
si une présence existe déjà.
Le moteur métier Presencia

Le backend est responsable de toutes les règles métier.

Il vérifie notamment :

l'existence de la séance ;
son état (active ou terminée) ;
l'existence de l'apprenant ;
son appartenance aux participants attendus ;
l'absence de présence déjà enregistrée.

Le backend est le seul composant autorisé à créer une présence.

États du scanner
S0 — Attente

Le scanner est disponible.

Il attend la présentation d'un QR Code.

Scanner prêt
S1 — Lecture

Le QR Code est détecté.

Le scanner décode son contenu.

À ce stade, aucune décision métier n'a encore été prise.

S2 — Identification

Le scanner identifie le type de QR.

Deux possibilités :

QR Séance

ou

QR Apprenant

Cette étape consiste uniquement à identifier la nature des données lues.

S3 — Transmission

Le scanner transmet les informations au backend.

Selon le type de QR :

QR Séance
        ↓
activation de la séance

QR Apprenant
        ↓
demande de validation de présence

Le scanner attend ensuite la réponse du moteur métier.

S4 — Validation métier

Le backend applique les règles de Presencia.

Selon le contexte, il peut retourner :

Présence enregistrée

Présence déjà enregistrée

Apprenant non prévu

QR inconnu

Séance terminée

Erreur

Toutes les décisions sont prises à cette étape.

S5 — Affichage

Le scanner présente le résultat au formateur.

Le message affiché est toujours orienté métier.

Exemples :

✅ Présence enregistrée

ℹ️ Présence déjà enregistrée

⚠️ Apprenant non prévu

❌ Badge non reconnu

Les messages techniques ne sont jamais affichés.

S6 — Retour en attente

Après affichage du résultat :

le scanner libère son état courant ;
il est prêt à lire un nouveau QR Code.

Le cycle recommence.

Représentation de la machine à états
          +------------------+
          |  S0  Attente     |
          +------------------+
                    │
               QR détecté
                    │
                    ▼
          +------------------+
          |  S1  Lecture     |
          +------------------+
                    │
                    ▼
          +------------------+
          | S2 Identification|
          +------------------+
             │          │
      QR séance   QR apprenant
             │          │
             └────┬─────┘
                  ▼
          +------------------+
          | S3 Transmission  |
          +------------------+
                  │
                  ▼
          +------------------+
          |S4 Validation     |
          |     métier       |
          +------------------+
                  │
                  ▼
          +------------------+
          | S5 Affichage     |
          +------------------+
                  │
                  ▼
          +------------------+
          |Retour attente S0 |
          +------------------+
Conséquences architecturales

Cette architecture présente plusieurs avantages :

une seule source de vérité pour les règles métier ;
aucune duplication entre le frontend et le backend ;
comportement prévisible du scanner ;
facilité de maintenance ;
possibilité de remplacer le scanner Web par une application mobile sans modifier les règles métier.
Principe d'architecture A1

Le scanner ne décide jamais. Presencia décide.

Le scanner lit.

Le moteur métier valide.

Le scanner informe le formateur.