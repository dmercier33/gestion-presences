Décision DP-001
Date : juillet 2026
Sujet :
QR apprenant fixe ou QR séance uniquement ?
Décision :
Conserver QR apprenant imprimable.
Raison :
Compatible terrain, pas de smartphone nécessaire,
facilite la rentrée.
Impact :
Le scanner formateur valide session + apprenant.

Décision V0.9.0 — DP-xxx à ajouter
Je mettrais dans ton document "Décisions importantes" :
Décision : création automatique de session_apprenants
Date : juillet 2026
Version : V0.9.0
Sujet
Définition du moment où sont créés les apprenants attendus d'une séance.
Décision
La table session_apprenants est générée automatiquement lors de l'ouverture d'une séance par le formateur.
La liste est issue de groupe_apprenants.
Raisons
correspond à la feuille papier d'émargement avant signatures ;
fige la situation réelle au moment de la séance ;
permet de distinguer :
apprenant attendu ;
apprenant présent ;
apprenant absent.
Impact
Le parcours devient :
Groupe
  |
  v
groupe_apprenants
  |
  v
Création séance
  |
  v
session_apprenants
  |
  v
presences


DP-00X — Verrouillage du moteur métier
Décision :
session_apprenants est désormais exclusivement créé à l'ouverture d'une séance.
/api/presences ne crée plus d'inscription implicite.
Raison :
L'émargement ne modifie jamais la liste des apprenants attendus.
Conséquence :
La feuille d'émargement est figée avant le début de la séance.


DP-00X — La présence ne crée jamais l'attendu
Décision :
La table session_apprenants est la référence des apprenants autorisés à émarger une séance.
La création d'une présence ne modifie jamais cette liste.
Raison :
Garantir une preuve fiable entre :
personnes prévues ;
personnes présentes.

Décision V0.8.1 : une présence n'est valide que si l'apprenant est attendu dans la séance.
Décision : Presencia dispose d'une documentation séparée selon son public. Les documents techniques expliquent la construction du produit ; les notices expliquent son utilisation.
V0.8.2 confirme une séparation claire entre le moteur métier Presencia et son interface utilisateur : les règles restent côté serveur, l'écran traduit les résultats en langage
