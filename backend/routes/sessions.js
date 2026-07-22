import express from "express";
import supabase from "../database/supabase.js";

const router = express.Router();

// ===============================
// OUVERTURE D'UNE SESSION
// ===============================
//
// Ouvre la séance courante d'un groupe.
// Si une séance active existe déjà pour ce groupe,
// elle est reprise.
// Sinon une nouvelle séance est créée avec son token associé.
//
// Cette route est appelée par l'écran formateur.
// Elle retourne les informations nécessaires à l'ouverture
// de la séance et à l'affichage du QR de session.
router.post("/", async (req, res) => {

  const {
    groupe_id,
    duration_minutes = 120
  } = req.body;

  if (!groupe_id) {
    return res.status(400).json({
      error: "groupe_id obligatoire"
    });
  }

  // Rechercher une séance déjà ouverte pour ce groupe.
  // Une séance existante est reprise afin d'éviter la création de doublons.
  const now = new Date();
  const { data: existingSession, error: existingError } =
    await supabase
      .from("sessions")
      .select(`
      id,
      token,
      groupe_id,
      started_at,
      expires_at,
      duration_minutes
    `)
      .eq("groupe_id", groupe_id)
      .is("ended_at", null)
      .gt("expires_at", now.toISOString())
      .maybeSingle();

  if (existingError) {
    return res.status(500).json({
      error: existingError.message
    });
  }

  // Si une séance ouverte existe déjà pour ce groupe,
  // elle est réutilisée afin d'éviter les doublons.
  if (existingSession) {
    return res.status(200).json({
      status: "existing",
      session: existingSession
    });
  }

  // Génération de l'identifiant interne de la séance.
  // Cet identifiant est utilisé comme référence
  // dans les tables sessions, session_apprenants et presences.  
  const sessionId = "SESSION_" + Date.now();

  // Génération du token associé à la séance.
  // Le token est utilisé pour identifier la session
  // lors du workflow QR session.
  const token = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  const createdAt = new Date();

  const expiresAt = new Date(
    createdAt.getTime() + duration_minutes * 60000
  );

  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        id: sessionId,
        token,
        groupe_id,
        duration_minutes,
        started_at: createdAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        active: true
      }
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      error
    });
  }

  // Workflow métier v0.9.0 :
  //
  // Création session
  //        ↓
  // Création session_apprenants
  //        ↓
  // Scan QR apprenant
  //        ↓
  // Création presence
  // =====================================================
  // Création de la liste des participants attendus pour la séance.
  // session_apprenants sert de référence pour contrôler
  // les apprenants autorisés à émarger.
  // =====================================================

  // La liste des participants attendus est figée
  // au moment de la création de la séance.
  // Elle correspond aux apprenants du groupe à cet instant.
  // Chaque apprenant du groupe devient un participant attendu
  // pour cette séance.
  const { data: membresGroupe, error: membresError } =
    await supabase
      .from("apprenants")
      .select("id")
      .eq("groupe_id", groupe_id);


  if (membresError) {
    return res.status(500).json({
      error: membresError.message
    });
  }


  if (membresGroupe && membresGroupe.length > 0) {

    const lignesSessionApprenants =
      membresGroupe.map((membre) => ({
        id: "SA_" + Date.now() + "_" + Math.random()
          .toString(36)
          .substring(2, 8),

        session_id: sessionId,

        apprenant_id: membre.id
      }));


    const { error: sessionApprenantsError } =
      await supabase
        .from("session_apprenants")
        .insert(lignesSessionApprenants);


    if (sessionApprenantsError) {
      return res.status(500).json({
        error: sessionApprenantsError.message
      });
    }

  }
  //

  res.json({
    status: "created",
    session: data
  });
});

export default router;