=======================================
# Présencia v0.9.0 — Release Notes
=======================================

Date : 19 juillet 2026

## 🎯 Objectif de la version

Cette version marque la stabilisation du cœur fonctionnel de Présencia.

La gestion complète d'une séance d'émargement est désormais opérationnelle :
* création d'une séance ;
* constitution automatique de la liste des apprenants attendus ;
* contrôle des droits d'émargement ;
* enregistrement des présences par QR code.

---

# ✅ Fonctionnalités livrées

## Gestion des groupes
* Gestion des groupes de formation.
* Association des apprenants à un groupe via `groupe_id`.
* Suppression de la dépendance à l'ancien mécanisme `groupe_apprenants` pour la constitution des groupes.

## Gestion des apprenants
* Création d'un apprenant avec :
  * nom ;
  * prénom ;
  * groupe associé.

* Consultation de la liste des apprenants.

* Affichage du groupe associé.

* Génération d'un QR code individuel apprenant.

---

## Gestion des sessions
Création d'une session avec :
* groupe concerné ;
* durée configurable ;
* date de début ;
* date d'expiration ;
* token de session.

Lors de la création :
* la session est enregistrée dans `sessions` ;
* la liste des apprenants attendus est créée dans `session_apprenants`.

Cette table constitue un **instantané des participants attendus pour cette séance**.

Règle métier :
> Une modification ultérieure du groupe d'un apprenant ne modifie pas l'historique d'une séance déjà créée.

---

## Émargement QR

Le workflow validé est :
```
Formateur

Création / ouverture séance
        ↓
Session créée
        ↓
Liste session_apprenants générée
        ↓
Scan QR apprenant
        ↓
Création présence
```

Contrôles réalisés :
* session existante ;
* session non expirée ;
* apprenant reconnu ;
* apprenant prévu dans la séance ;
* absence de doublon de présence.

---

## Base de données

Tables principales utilisées :

### sessions
Stockage des séances :
* identifiant session ;
* groupe ;
* token ;
* durée ;
* dates de validité.

### session_apprenants
Snapshot des apprenants attendus :
* session ;
* apprenant.

### presences
Historique réel des émargements :
* session ;
* apprenant ;
* type de scan ;
* date/heure.

---

# 🔒 Règles métier stabilisées

## Une session prépare les attendus
La création d'une session définit la liste théorique des participants.

## Une présence constate la réalité
Le scan QR ne crée pas d'attendu :
il vérifie que l'apprenant appartient bien à la séance.

## Historisation
Les changements futurs de groupes ne modifient pas les anciennes séances.

---

# 🧪 Tests validés
## Création session
✅ Session créée.

## Génération session_apprenants
✅ Les apprenants du groupe sont copiés dans la séance.

## Scan apprenant autorisé
✅ Présence créée.

## Scan apprenant non prévu
✅ Refus métier.

## Scan en doublon
✅ Détection prévue.

---

# ⚠️ Points connus / dette technique identifiée

Ces éléments ne bloquent pas la release.

## DT-001 — Latence environnement Render
Observation :
* délai parfois important entre action utilisateur et apparition des données.
Piste :
* environnement Render ;
* réveil service ;
* latence réseau.
À investiguer en 0.9.x.

---

## DT-002 — Gestion avancée des affectations
Évolutions futures :
* changement de groupe d'un apprenant ;
* historique des affectations ;
* gestion administrative des inscriptions.

---

## DT-003 — Amélioration messages utilisateur
Exemples :
* doublon de présence ;
* session expirée ;
* apprenant non attendu.

---

# 🚀 Conclusion
Présencia v0.9.0 fournit désormais un socle fonctionnel complet pour l'émargement FLE :

**Session → Attendus → Scan → Présence**
Cette version constitue la base stable pour les évolutions futures.