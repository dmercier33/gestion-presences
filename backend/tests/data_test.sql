-- =========================================
-- DONNEES DE TEST MINIMALES
-- =========================================

INSERT INTO groupes(id, code, libelle)
VALUES
('GRP_TEST_001','TEST001','Groupe test 001')
ON CONFLICT DO NOTHING;
INSERT INTO groupes(id, code, libelle)
VALUES
('GRP_G1','TESTG1','Groupe test G1')
ON CONFLICT DO NOTHING;

INSERT INTO apprenants(id, nom, prenom, qr_code)
VALUES
(
'APP_TEST_001',
'DUPONT',
'Jean',
'QR_TEST_001'
)
ON CONFLICT DO NOTHING;


INSERT INTO groupe_apprenants(id,groupe_id,apprenant_id)
VALUES
(
'GA_TEST_001',
'GRP_TEST_001',
'APP_TEST_001'
)
ON CONFLICT DO NOTHING;
