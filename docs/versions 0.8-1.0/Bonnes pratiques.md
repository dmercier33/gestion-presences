Et les "bonnes pratiques" qu'on devra garder en tête

Je note surtout celles qui ont émergé de nos galères :

ne pas ajouter de logs permanents pour déboguer 😅
→ utiliser plutôt :
console temporaire identifiée ;
outils navigateur ;
tests API ;
inspection Supabase.
quand une information manque : on vérifie avant de supposer
(ta règle du "on ne joue pas au poker" est effectivement une bonne règle de debug).
un changement = une étape identifiable
(ça rejoint ta règle commit/message).
ne pas refactorer pendant une panne
→ d'abord rétablir le fonctionnement, ensuite améliorer.




les bonnes pratiques de debug :
Règles de debug à appliquer
0) Limite de boucle de test

Si un test tourne en rond sans information nouvelle :

⏱️ maximum ~10 minutes ;
on arrête de répéter le même scénario ;
on change d'angle :
revue du code concerné ;
vérification de l'architecture ;
inspection des données entrantes/sortantes.

Objectif :

ne pas transformer un test de validation en séance d'acharnement.

1) Revue de code obligatoire en absence de diagnostic

Si :

pas d'erreur console ;
pas d'erreur réseau claire ;
pas de log exploitable ;
comportement incohérent ;

alors on revient immédiatement aux sources :

index.htm
module JS concerné (formateur.js, scanner.js, api.js)
flux des appels
responsabilités de chaque fichier.

Avant d'ajouter des tests ou des logs.

Et j'ajoute aussi un troisième rappel issu de ce soir :

2) Pas de modification de diagnostic dans tous les fichiers

Avant d'ajouter un log ou un bout de test :

identifier le point exact où l'information manque ;
ajouter au maximum une observation ciblée ;
retirer les tests temporaires après résolution.

Le problème du bouton nous a rappelé qu'on peut facilement polluer l'environnement avec des traces de debug.

Un fichier complet vaut mieux que dix micro-modifications.