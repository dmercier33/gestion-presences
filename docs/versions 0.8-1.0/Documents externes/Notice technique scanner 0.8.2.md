Contrat UX Scanner Formateur — Draft V0.8.2

succès	✅ Présence enregistrée	✅ Présence enregistrée + nom
doublon	ℹ️ Présence déjà enregistrée (supposé)	ℹ️ Déjà émargé
QR invalide	❌ QR invalide	❌ QR non reconnu
QR sans type	❌ QR sans type	❌ Badge invalide
session absente	⚠️ Scannez d'abord le QR séance	✅ Scannez d'abord la séance
caméra	Erreur caméra brut	📷 Autorisez la caméra

1. Principes
Principe 1
Le formateur ne doit jamais voir une erreur technique.

Interdit :
Already registered
Session not found
Missing sessionId

Remplacé par :
ℹ️ Présence déjà enregistrée
❌ Séance inconnue
⚠️ Séance non sélectionnée

Principe 2
Chaque message doit répondre à une question :
"Que vient-il de se passer et que dois-je faire maintenant ?"

2. États normaux

État S0 — Scanner prêt
Affichage :
📷 Scanner prêt
Présentez le QR apprenant

État S1 — Séance reconnue
Après scan QR séance :
✅ Séance ouverte
Groupe FLE G1
Scannez les apprenants

État S2 — Apprenant reconnu
Après lecture QR :
👤 Denis Mercier
Vérification en cours...

État S3 — Présence validée
✅ Présence enregistrée
Denis Mercier
14:39

3. Cas d'erreur métier

E1 — Déjà enregistré
Situation :
la présence existe déjà.
Message :
ℹ️ Présence déjà enregistrée
Denis Mercier
a déjà émargé cette séance
Action :
continuer.

E2 — QR inconnu
Situation :
QR absent de la base.
Message :
❌ QR apprenant inconnu
Badge non reconnu
Action :
vérifier le badge.

E3 — Apprenant non attendu
Situation :
pas de ligne dans session_apprenants.
Message :
⚠️ Apprenant non prévu
Cet apprenant n'est pas inscrit
à cette séance
Action :
vérifier le groupe.

E4 — Séance absente
Message :
❌ Aucune séance active
Scannez d'abord le QR séance

E5 — Séance expirée
Message :
⏰ Séance terminée
Ouvrez une nouvelle séance

4. Cas techniques visibles
Caméra refusée
Message :
📷 Caméra inaccessible
Autorisez l'accès caméra
dans votre navigateur

5. Informations utiles à afficher après validation :
Priorité :
prénom + nom ;
heure ;
groupe ;
compteur éventuel :
✅ Présence enregistrée
Denis Mercier
Présents : 12 / 18
(le compteur pourra attendre une évolution)

6. Hors périmètre V0.8.2
❌ refonte interface
❌ application mobile
❌ authentification
❌ historique détaillé
❌ statistiques


Ajout proposé 1 — Responsabilité du scanner
Rôle du scanner dans Presencia
Le scanner n'est pas responsable de la règle métier.
Il est responsable de :
lire un QR ;
transmettre l'information au moteur métier ;
afficher clairement le résultat.
La décision appartient au backend.
Exemple :
Scanner
   |
   | QR apprenant
   ↓
API Presencia
   |
   | Validation métier
   ↓
Résultat utilisateur
Cela évite qu'un jour on mette une règle métier uniquement dans le frontend.

Ajout proposé 2 — Priorité des informations affichées
Quand plusieurs informations existent, l'ordre est :
1. Résultat métier
Exemple :
✅ Présence enregistrée
avant :
ID session : SESSION_1784384537927

2. Personne concernée
Exemple :
Denis Mercier

3. Action suivante
Exemple :
Scannez l'apprenant suivant

4. Informations techniques
Uniquement :
console développeur ;
logs temporaires ;
outils diagnostic.
Jamais dans l'interface formateur.