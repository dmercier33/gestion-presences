Workflow métier et gestion des états du scanner Presencia v0.9


1) Workflow métier nominal

La règle est maintenant simple :

FORMATEUR
ouvre une séance
        ↓
création / reprise SESSION
        ↓
SESSION ACTIVE connue du scanner
        ↓
scanner un apprenant
        ↓
validation présence
        ↓
résultat
        ↓
apprenant suivant


Le workflow nominal ne nécessite plus le scan systématique d'un QR Session.

Le scanner fonctionne avec une session active préalablement connue et validée.

Le QR Session reste disponible comme mécanisme alternatif permettant de sélectionner ou restaurer une session.


Il n'y a qu'une boucle métier principale :

SESSION ACTIVE
        ↓
APPRENANT
        ↓
PRESENCE



2) Les états internes du scanner

Le scanner n'est pas juste une caméra.

C'est une petite machine à états.

Ses variables représentent son contexte interne.

Variables principales :

let activeSessionId = null;
let qrApprenant = null;
let isScanning = true;
let presenceEnCours = false;


Ces variables représentent les états du scanner.

Elles ne contiennent aucune décision métier.


Principe fondamental :

BACKEND = source de vérité métier

ETATS JS = orchestration du scanner

localStorage = cache utilisateur



État 0 — Initialisation

Au chargement :

activeSessionId = null
qrApprenant = null
isScanning = true
presenceEnCours = false


Le scanner recherche son contexte d'émargement.

Il peut retrouver une session précédemment utilisée :

localStorage.activeSessionId


Mais cette information n'est jamais considérée comme fiable par défaut.

Elle doit être validée par le backend.



État 1 — Validation de la session active

Le scanner vérifie si une session active existe.

Flux :

activeSessionId local
        ↓
validation backend
        ↓
session valide ?


Cas 1 : session valide

Le scanner devient opérationnel.

Message :

🟢 Session active OK

📷 Scanner un apprenant


Etat :

activeSessionId = XXX
qrApprenant = null



Cas 2 : session invalide

La session locale est supprimée.

Le scanner revient dans un état neutre.

Message :

⚠️ Aucune session active


Aucune décision métier n'est prise côté frontend.



État 2 — Session active prête

Le scanner possède un contexte valide.

Il attend un QR apprenant.


Etat :

activeSessionId = XXX
qrApprenant = null


Message :

📷 Scanner un apprenant



État 3 — Lecture apprenant

Le badge arrive :

{
  type:"APPRENANT",
  qrCode:"APP_xxx"
}


Le scanner récupère :

qrApprenant = data.qrCode


Puis affiche :

📷 QR apprenant détecté

Validation en cours...


Le scanner transmet immédiatement la demande au backend.



État 4 — Validation en cours

C'est le rôle de :

presenceEnCours


Il devient :

true


Pourquoi ?

Pour empêcher plusieurs scans simultanés pendant que la requête réseau est en cours.


Exemple :

APP_123
   |
   +--> POST présence
   |
   +--> deuxième scan
          |
          +--> deuxième POST


Le verrou protège l'expérience utilisateur.

Il ne remplace jamais les contrôles métier du backend.



État 5 — Retour backend

Le backend applique les règles Presencia.

Il peut répondre :



Cas 1 : Présence enregistrée

HTTP 200

{
  status:"ok"
}


Affichage :

✅ Présence enregistrée



Cas 2 : Présence déjà enregistrée

HTTP 409

{
  code:"PRESENCE_ALREADY_EXISTS"
}


Affichage :

ℹ️ Présence déjà enregistrée



Cas 3 : Apprenant non prévu

HTTP 403

{
  error:"Apprenant non prévu pour cette séance"
}


Affichage :

⚠️ Apprenant non prévu



Cas 4 : Apprenant inconnu

Affichage :

❌ Badge non reconnu



Cas 5 : Session invalide

Exemples :

- session inexistante ;
- session terminée ;
- session expirée.


Affichage :

⚠️ Session non disponible


Les messages techniques internes ne sont jamais affichés au formateur.



État 6 — Retour attente

Après le retour backend :

presenceEnCours = false

qrApprenant = null


Le scanner revient :

🟢 Session active OK

📷 Scanner un apprenant


Le cycle recommence.



3) Les timers : où interviennent-ils vraiment ?


Un timer n'est pas un état métier.

Un timer ne décide jamais :

- si une présence est valide ;
- si une session existe ;
- si un apprenant est accepté.


Ces décisions appartiennent au backend.


Les timers servent uniquement à l'expérience utilisateur.



Exemple : arrêt caméra après lecture


setTimeout(
    stopperCamera,
    1500
);


Cela signifie :

"Laisser le temps à l'utilisateur de lire le résultat."


Ce n'est pas :

"Attendre 1,5 seconde avant de valider."


La validation part immédiatement.



Exemple chronologique réel


Sans temporisation UX :

14:24:08
QR détecté

14:24:08.050
POST /api/presences

14:24:08.200
réponse OK

14:24:08.201
affichage message

14:24:08.300
caméra repart


Trop rapide pour un humain.



Avec temporisation UX :

14:24:08
QR détecté

14:24:08.050
POST API

14:24:08.200
réponse OK

14:24:08.201
✅ Présence enregistrée

14:24:09.700
caméra repart


Le cerveau humain suit.



4) La règle d'or pour Presencia


BACKEND = vérité métier

ETATS JS = orchestration scanner

activeSessionId = contexte local validé

TIMERS = confort utilisateur


Si ces règles sont respectées, l'application reste saine.



5) Principe d'architecture A2


Le scanner ne décide jamais.

Presencia décide.


Le scanner :

- connaît son contexte ;
- lit ;
- transmet ;
- informe le formateur.


Le moteur métier :

- contrôle ;
- valide ;
- crée la présence.