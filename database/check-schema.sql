1) Vérifier la structure de sessions
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

On doit retrouver au minimum :

id
token
groupe_id
duration_minutes
started_at
expires_at
ended_at
active
status
created_at

2) Vérifier la structure de apprenants
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'apprenants'
ORDER BY ordinal_position;

On attend notamment :

id
qr_code
nom
prenom
groupe

3) Vérifier la structure de session_apprenants
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'session_apprenants'
ORDER BY ordinal_position;

Attendu :

id
session_id
apprenant_id

4) Vérifier la structure de presences

(important depuis l'ajout de type_scan)

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'presences'
ORDER BY ordinal_position;

Attendu :

id
session_id
apprenant_id
type_scan
created_at
Vérification des clés étrangères

5) Relations entre tables
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

On veut voir :

presences.session_id
        -> sessions.id

presences.apprenant_id
        -> apprenants.id

session_apprenants.session_id
        -> sessions.id

session_apprenants.apprenant_id
        -> apprenants.id
Vérification des doublons impossibles

6) Un apprenant ne doit apparaître qu'une fois par session
SELECT
    session_id,
    apprenant_id,
    COUNT(*)
FROM presences
GROUP BY session_id, apprenant_id
HAVING COUNT(*) > 1;

Résultat attendu :

0 ligne

7) Vérifier les doublons dans session_apprenants
SELECT
    session_id,
    apprenant_id,
    COUNT(*)
FROM session_apprenants
GROUP BY session_id, apprenant_id
HAVING COUNT(*) > 1;

Même résultat attendu :

0 ligne
Vérification des contraintes uniques

8) Index et contraintes uniques
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN (
    'sessions',
    'presences',
    'session_apprenants',
    'apprenants'
)
ORDER BY tablename;

9) Voir les sessions actives
Vérification des sessions actuellement ouvertes
SELECT
    id,
    groupe_id,
    started_at,
    expires_at,
    active,
    ended_at
FROM sessions
WHERE active = true
ORDER BY created_at DESC;

Vérification des sessions expirées mais encore actives

Celle-ci va nous dire si le nettoyage futur est nécessaire :

SELECT *
FROM sessions
WHERE active = true
AND expires_at < NOW();

Idéalement :

0 ligne
Vérification métier complète MVP-1

10) Vue d'ensemble des présences
SELECT
    s.id AS session,
    s.groupe_id,
    a.nom,
    a.prenom,
    p.type_scan,
    p.created_at
FROM presences p
JOIN sessions s 
ON p.session_id = s.id
JOIN apprenants a
ON p.apprenant_id = a.id
ORDER BY p.created_at DESC;
