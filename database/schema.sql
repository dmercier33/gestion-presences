create table if not exists apprenants (
  id text primary key,
  nom text,
  prenom text,
  email text,
  created_at timestamp default now()
);
ALTER TABLE apprenants
ADD COLUMN qr_code text;

create table if not exists sessions (
  id text primary key,
  created_at timestamp default now(),
  status text default 'active'
);
alter table sessions add column created_by text;
alter table sessions add column start_time timestamp;
alter table sessions add column end_time timestamp;
ALTER TABLE public.sessions
ADD COLUMN duration_minutes integer DEFAULT 120;
ALTER TABLE public.sessions
ADD COLUMN expires_at timestamp without time zone;
ALTER TABLE public.sessions
DROP COLUMN started_at,
DROP COLUMN start_time,
DROP COLUMN end_time;

ALTER TABLE public.sessions
ALTER COLUMN started_at TYPE timestamptz
USING started_at AT TIME ZONE 'UTC';

ALTER TABLE public.sessions
ALTER COLUMN expires_at TYPE timestamptz
USING expires_at AT TIME ZONE 'UTC';

ALTER TABLE public.sessions
ALTER COLUMN ended_at TYPE timestamptz
USING ended_at AT TIME ZONE 'UTC';


create table if not exists presences (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  apprenant_id text not null,
  created_at timestamp default now()
);
ALTER TABLE presences
ADD COLUMN created_at timestamptz DEFAULT now();

// =========================================
// anti doublons (crucial FSE)
alter table presences
add constraint unique_presence unique (session_id, apprenant_id);

alter table presences
add constraint fk_session
foreign key (session_id) references sessions(id)
on delete cascade;

//clés etrangeres (intégrité des données)
alter table presences
add constraint fk_apprenant
foreign key (apprenant_id) references apprenants(id)
on delete cascade;


======= ROADMAP #2

create table groupes (
  id text primary key,
  code text not null unique,
  libelle text,
  created_at timestamp default now()
);

create table groupe_apprenants (
  id text primary key,
  groupe_id text references groupes(id),
  apprenant_id text references apprenants(id),
  created_at timestamp default now()
);