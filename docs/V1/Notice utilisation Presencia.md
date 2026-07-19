Notice utilisation Presencia

Version : Draft V0.8.2
Document utilisateur — Formateur

1. Présentation de Presencia
Presencia est une application d'émargement numérique destinée aux organismes de formation.
Elle permet au formateur de :
créer une séance de formation ;
identifier les apprenants présents ;
conserver une preuve fiable de présence.

Le principe :
Séance
   ↓
Apprenants attendus
   ↓
Présences enregistrées

2. Préparation avant utilisation
Avant une séance, l'organisme prépare :
les groupes de formation ;
les apprenants associés ;
les badges QR individuels.

Chaque apprenant dispose d'un QR personnel permettant son identification.

3. Ouvrir une séance
Le formateur :
ouvre Presencia ;
sélectionne le groupe concerné ;
crée une nouvelle séance.

Presencia génère alors un QR de séance.
Ce QR identifie la séance en cours.

4. Réaliser l'émargement
Pendant la séance :
le formateur ouvre le scanner ;
il scanne le QR de séance ;
il scanne le QR de chaque apprenant.

Pour chaque scan, Presencia vérifie :
que la séance existe ;
que la séance est ouverte ;
que l'apprenant est connu ;
que l'apprenant est prévu dans cette séance ;
que la présence n'a pas déjà été enregistrée.

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
Action :
Continuer l'émargement.

⚠️ Apprenant non prévu
L'apprenant existe mais n'est pas attendu dans cette séance.
Action :
Vérifier :
le groupe sélectionné ;
l'inscription de l'apprenant.

❌ QR apprenant inconnu
Le badge n'est pas reconnu par Presencia.
Action :
Vérifier le badge ou demander une régénération du QR.

⚠️ Séance terminée
La séance n'accepte plus de nouvelles présences.
Action :
Créer une nouvelle séance si nécessaire.

6. Consultation des présences
À l'issue de la séance, Presencia conserve :
la séance réalisée ;
les apprenants associés ;
les présences enregistrées ;
les horaires d'émargement.
Ces informations constituent la trace numérique de l'émargement.

7. Bonnes pratiques formateur
Pour garantir la fiabilité de l'émargement :
✅ vérifier le groupe avant de démarrer ;
✅ ouvrir une séance par cours ;
✅ conserver les badges QR des apprenants ;
✅ effectuer les scans pendant la présence réelle des personnes.

8. Principe de fiabilité Presencia
Presencia distingue :
Les apprenants prévus
session_apprenants
et
Les apprenants réellement présents
presences
Cette distinction garantit une meilleure traçabilité de l'émargement.