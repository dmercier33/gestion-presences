create table if not exists apprenants (
  id text primary key,
  nom text,
  prenom text,
  email text,
  created_at timestamp default now()
);

create table if not exists sessions (
  id text primary key,
  created_at timestamp default now(),
  status text default 'active'
);
alter table sessions add column created_by text;
alter table sessions add column start_time timestamp;
alter table sessions add column end_time timestamp;

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
