Gestion présences FLE

Architecture :
- frontend
- backend
- Supabase

Flux QR :
1. Création séance
2. Génération session_apprenants
3. Scan QR apprenant
4. Validation backend
5. Création présence

Règle QR :
- un apprenant possède un QR durable
- le QR n'est pas régénéré lors d'un affichage
- le QR identifie l'apprenant dans le référentiel
