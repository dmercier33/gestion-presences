-- =========================================
-- RESET SCHEMA TEST
-- =========================================

DROP TABLE IF EXISTS presences CASCADE;
DROP TABLE IF EXISTS session_apprenants CASCADE;
DROP TABLE IF EXISTS groupe_apprenants CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS apprenants CASCADE;
DROP TABLE IF EXISTS groupes CASCADE;


-- =========================================
-- GROUPES
-- =========================================

CREATE TABLE groupes (
    id text PRIMARY KEY,
    code text UNIQUE NOT NULL,
    libelle text,
    created_at timestamptz DEFAULT now()
);


-- =========================================
-- APPRENANTS
-- =========================================

CREATE TABLE apprenants (
    id text PRIMARY KEY,
    nom text,
    prenom text,
    email text,
    qr_code text UNIQUE,
    created_at timestamptz DEFAULT now()
);

alter table apprenants
add column groupe_id text;

alter table apprenants
add constraint fk_apprenants_groupe
foreign key (groupe_id)
references groupes(id)
on delete set null;

-- =========================================
-- SESSIONS
-- =========================================

CREATE TABLE sessions (
    id text PRIMARY KEY,
    token text NOT NULL,
    groupe_id text NOT NULL,

    duration_minutes integer DEFAULT 120,

    started_at timestamptz DEFAULT now(),
    expires_at timestamptz,

    ended_at timestamptz,

    active boolean DEFAULT true,
    status text DEFAULT 'active',

    created_at timestamptz DEFAULT now(),

    CONSTRAINT fk_sessions_groupes
    FOREIGN KEY (groupe_id)
    REFERENCES groupes(id)
    ON DELETE CASCADE
);


-- =========================================
-- RELATION GROUPE / APPRENANTS
-- =========================================

CREATE TABLE groupe_apprenants (
    id text PRIMARY KEY,

    groupe_id text NOT NULL,
    apprenant_id text NOT NULL,

    created_at timestamptz DEFAULT now(),

    CONSTRAINT fk_groupe_apprenants_groupe
    FOREIGN KEY (groupe_id)
    REFERENCES groupes(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_groupe_apprenants_apprenant
    FOREIGN KEY (apprenant_id)
    REFERENCES apprenants(id)
    ON DELETE CASCADE,

    UNIQUE(groupe_id, apprenant_id)
);


-- =========================================
-- RELATION SESSION / APPRENANTS
-- =========================================

CREATE TABLE session_apprenants (
    id text PRIMARY KEY,

    session_id text NOT NULL,
    apprenant_id text NOT NULL,

    created_at timestamptz DEFAULT now(),

    CONSTRAINT fk_session_apprenants_session
    FOREIGN KEY (session_id)
    REFERENCES sessions(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_session_apprenants_apprenant
    FOREIGN KEY (apprenant_id)
    REFERENCES apprenants(id)
    ON DELETE CASCADE,

    UNIQUE(session_id, apprenant_id)
);


-- =========================================
-- PRESENCES
-- =========================================

CREATE TABLE presences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    session_id text NOT NULL,
    apprenant_id text NOT NULL,

    created_at timestamptz DEFAULT now(),


    CONSTRAINT fk_presence_session
    FOREIGN KEY (session_id)
    REFERENCES sessions(id)
    ON DELETE CASCADE,


    CONSTRAINT fk_presence_apprenant
    FOREIGN KEY (apprenant_id)
    REFERENCES apprenants(id)
    ON DELETE CASCADE,


    -- anti double émargement
    CONSTRAINT unique_presence
    UNIQUE(session_id, apprenant_id)
);

ALTER TABLE presences
ADD COLUMN type_scan text DEFAULT 'qr';