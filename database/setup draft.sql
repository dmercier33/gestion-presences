
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
