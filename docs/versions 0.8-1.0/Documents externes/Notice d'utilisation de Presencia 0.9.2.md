Notice utilisation Presencia
Version : V0.9.2
Document utilisateur — Formateur
1. Présentation de Presencia

Presencia est une application d'émargement numérique destinée aux organismes de formation.

Elle permet au formateur de :

créer une séance de formation ;
identifier les apprenants présents ;
enregistrer automatiquement les présences ;
conserver une trace numérique fiable de l'émargement.

Le principe :

Séance
   ↓
Apprenants attendus
   ↓
Présences enregistrées

Presencia distingue toujours :

les apprenants prévus dans une séance ;
les apprenants réellement présents.
2. Préparation avant utilisation

Avant une séance, l'organisme prépare :

les groupes de formation ;
les apprenants associés ;
les badges QR individuels.

Chaque apprenant dispose d'un QR personnel permettant son identification.

Ce QR est :

permanent ;
associé à un seul apprenant ;
imprimable.
3. Ouvrir une séance

Le formateur :

ouvre Presencia ;
sélectionne le groupe concerné ;
crée une nouvelle séance.

Presencia génère alors un QR séance.

Ce QR permet d'identifier le contexte d'émargement :

la séance concernée ;
le groupe attendu ;
la période d'enregistrement.
4. Réaliser l'émargement

Pendant la séance :

le formateur ouvre le scanner ;
il scanne le QR séance ;
il scanne le QR personnel de chaque apprenant.

Pour chaque scan, Presencia vérifie automatiquement :

que la séance existe ;
que la séance est active ;
que l'apprenant est connu ;
que l'apprenant appartient aux participants attendus ;
que la présence n'a pas déjà été enregistrée.

La décision d'enregistrer une présence est réalisée par Presencia.

À chaque QR Code présenté, Presencia vérifie automatiquement la situation (séance, apprenant, présence) puis affiche immédiatement le résultat de cette vérification.

5. Résultats possibles
✅ Présence enregistrée

La présence est validée.

Exemple :

✅ Présence enregistrée

Denis Mercier

14:39

Le formateur peut passer à l'apprenant suivant.

ℹ️ Présence déjà enregistrée

L'apprenant a déjà émargé cette séance.

Exemple :

ℹ️ Présence déjà enregistrée

Denis Mercier

Action :

➡️ Continuer l'émargement.

⚠️ Apprenant non prévu

L'apprenant existe mais n'est pas attendu dans cette séance.

Cela signifie qu'il n'existe pas dans la liste des participants prévue pour cette séance.

Action :

Vérifier :

le groupe sélectionné ;
l'inscription de l'apprenant ;
la séance ouverte.
❌ QR apprenant inconnu

Le badge n'est pas reconnu par Presencia.

Action :

Vérifier :

que le badge présenté correspond bien à l'apprenant ;
que l'apprenant existe dans Presencia.
⚠️ Séance non sélectionnée

Aucune séance active n'est disponible pour l'émargement.

Action :

Scanner d'abord le QR séance.

⏰ Séance terminée

La séance n'accepte plus de nouvelles présences.

Action :

Créer une nouvelle séance si nécessaire.

6. Consultation des présences

À l'issue de la séance, Presencia conserve :

la séance réalisée ;
les apprenants attendus ;
les présences enregistrées ;
les horaires d'émargement.

Ces informations constituent la trace numérique de l'émargement.

7. Bonnes pratiques formateur

Pour garantir la fiabilité de l'émargement :

✅ vérifier le groupe avant de démarrer ;
✅ ouvrir une séance par cours ;
✅ utiliser le badge QR personnel de chaque apprenant ;
✅ effectuer les scans pendant la présence réelle des personnes ;
✅ vérifier les messages affichés après chaque scan.

8. Principe de fiabilité Presencia

Presencia distingue :

Les apprenants prévus

Table interne :

session_apprenants

Cette liste représente les personnes attendues pour la séance.

Les apprenants réellement présents

Table interne :

presences

Cette liste représente les personnes ayant effectivement émargé.

Cette séparation garantit :

une meilleure traçabilité ;
un contrôle des présences ;
une cohérence entre participants attendus et participants présents.
9. Sécurité de l'émargement

Presencia applique plusieurs contrôles :

un apprenant ne peut être enregistré deux fois sur la même séance ;
un apprenant non prévu ne peut pas émarger une séance ;
chaque présence est associée à une séance précise ;
chaque présence conserve son heure d'enregistrement.