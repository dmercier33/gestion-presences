Dictionnaire produit Presencia
Version v0.9.2 — Base stable avant évolutions métier
Objectif du document

Définir les termes métier et techniques utilisés dans Presencia afin de garantir une compréhension commune entre :

l'interface utilisateur ;
la base de données ;
l'API ;
la documentation technique ;
les futures évolutions de conformité.
Règles de vocabulaire

Un même terme doit conserver le même sens dans :

l'interface ;
la base de données ;
l'API ;
les exports ;
la documentation.

Toute évolution métier doit respecter ce dictionnaire.

Apprenant
Définition

Personne inscrite dans une action de formation FLE et susceptible d'être émargée lors d'une séance.

Utilisation dans Presencia

L'apprenant possède une identité numérique permettant :

son identification ;
son rattachement aux séances ;
l'historisation de ses présences.
Identifiant

Chaque apprenant possède un identifiant unique.

QR apprenant associé

Chaque apprenant peut disposer d'un QR permanent permettant son identification lors de l'émargement.

Tables associées
apprenants
Séance
Définition

Événement réel de formation correspondant à une période d'enseignement donnée.

Une séance représente une occurrence concrète de formation.

Exemple :

Cours FLE du lundi 14h00 au centre X.

Utilisation dans Presencia

Une séance :

est créée par le formateur ;
possède un contexte de formation ;
définit la période pendant laquelle les présences peuvent être enregistrées.
Données associées
date ;
horaires ;
groupe concerné ;
participants attendus.
Tables associées
sessions
Séance active
Définition

Séance pendant laquelle l'émargement est autorisé.

Règle métier

Une séance est considérée active lorsque :

heure actuelle < heure début + durée prévue
Utilisation

Permet :

d'éviter les scans hors période ;
de contrôler le contexte de présence.
Présence
Définition

Enregistrement attestant qu'un apprenant était présent à une séance donnée.

Utilisation dans Presencia

Une présence est créée après :

identification de l'apprenant ;
vérification de la séance ;
contrôle de l'appartenance à la liste attendue ;
validation du scan QR.
Protection métier

Une seule présence est autorisée pour un couple :

(session_id + apprenant_id)
Tables associées
presences
Émargement
Définition

Processus permettant de recueillir et conserver une preuve de participation d'un apprenant à une séance.

Utilisation dans Presencia

Dans la version actuelle :

L'émargement est réalisé par :

scan QR apprenant
        ↓
validation métier
        ↓
création présence
Évolution prévue

Pour une cible FSE renforcée :

authentification ;
signature électronique ;
journal d'audit ;
génération documentaire.
QR apprenant
Définition

Identifiant QR permanent associé à un apprenant.

Utilisation

Permet :

identification rapide ;
suppression de la saisie manuelle ;
impression individuelle ;
contrôle d'appartenance.
Règle métier validée

Le QR apprenant :

est créé une seule fois ;
est conservé ;
n'est pas régénéré automatiquement.
Table associée
apprenants.qr_code
QR séance
Définition

Identifiant temporaire représentant une séance.

Utilisation

Permet :

rattacher un scan à une séance ;
éviter un émargement hors contexte ;
identifier la séance ouverte.
Statut

Fonctionnel mais susceptible d'évolution selon le futur modèle d'authentification.

Session_apprenants
Définition

Liste nominative des apprenants attendus pour une séance donnée.

Cette table représente le cadrage préalable de l'émargement.

Elle correspond à la liste papier des participants avant signature.

Utilisation dans Presencia

Lorsqu'une séance est créée :

les apprenants concernés sont associés ;
cette liste devient la référence de contrôle.

Pendant l'émargement :

Un apprenant peut être enregistré présent uniquement s'il appartient à cette liste.

Protection métier

Un apprenant ne peut apparaître qu'une seule fois dans une séance.

Contrainte :

UNIQUE(session_id, apprenant_id)
Tables associées
sessions
apprenants
session_apprenants
presences
Formateur
Définition

Personne responsable de la création et du suivi des séances.

Statut actuel

Concept métier identifié mais authentification non encore implémentée.

Évolution prévue

Association avec :

compte utilisateur ;
rôle ;
historique des actions.
Administrateur
Définition

Utilisateur disposant de droits de gestion globale.

Évolution prévue

Gestion :

utilisateurs ;
paramètres ;
exports ;
supervision.
Groupe
Définition

Ensemble d'apprenants partageant une même organisation pédagogique.

Utilisation

Un groupe sert à préremplir les participants d'une séance.

Tables associées
groupes
groupe_apprenants
apprenants
sessions
Import apprenants
Définition

Fonction permettant de créer ou mettre à jour une liste d'apprenants depuis une source externe.

Statut

À développer.

Export présence
Définition

Production d'un document présentant les présences enregistrées.

Évolution prévue

Formats :

PDF ;
Excel ;
CSV.
Audit trail
Définition cible

Journal permanent des événements importants réalisés dans Presencia.

Exemples :

connexion
création séance
scan apprenant
export document
Statut

À développer.

Conformité FSE+ — cible future

Les éléments suivants ne font pas partie du cœur v0.9.2 mais constituent la trajectoire de conformité :

authentification utilisateurs ;
gestion des rôles ;
signature électronique ;
journal d'audit complet ;
archivage sécurisé ;
exports officiels ;
intégrité documentaire.
État du modèle v0.9.2
Apprenant
    |
    | QR permanent
    |
Séance
    |
    | participants attendus
    |
Session_apprenants
    |
    | validation
    |
Présence

Garanties actuelles :

✅ apprenant unique
✅ QR permanent
✅ participant unique par séance
✅ présence unique par séance/apprenant
✅ horodatage de présence
✅ contrôle métier avant création