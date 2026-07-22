import express from "express";
import supabase from "../database/supabase.js";

const router = express.Router();

// =====================================================
// CONSULTATION DES PRÉSENCES D'UNE SÉANCE
// =====================================================
//
// Rôle :
// Retourne les émargements enregistrés pour une séance.
// Cette route permet au formateur de suivre les présences.
//
// Utilisateur concerné :
// Formateur
router.get("/:sessionId", async (req, res) => {

  const { sessionId } = req.params;

  try {

    const { data, error } = await supabase
      .from("presences")
      .select(`
        id,
        session_id,
        scan_time,
        created_at,
        apprenants!presences_apprenant_id_fkey (
          nom,
          prenom,
          groupe_id
        )
      `)
      .eq("session_id", sessionId);


    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    res.json(data);

  } catch (error) {

    console.error("ERREUR PRESENCE COMPLETE :", error);
    res.status(500).json({
      error: error.message
    });
  }

});

// =====================================================
// ENREGISTREMENT D'UNE PRÉSENCE
// =====================================================
//
// Rôle :
// Enregistre l'émargement d'un apprenant.
//
// Vérifications :
// - séance existante
// - séance ouverte et non expirée
// - apprenant identifié par son QR
// - apprenant attendu dans session_apprenants
// - absence de doublon de présence
//
// Utilisateur concerné :
// Formateur
router.post("/", async (req, res) => {

  const { sessionId, qrCode } = req.body;

  console.log("===== API PRESENCES =====");
  console.log("sessionId :", sessionId);
  console.log(
    "qrCode reçu :",
    qrCode ? "présent" : "absent"
  );

  if (!sessionId || !qrCode) {
    return res.status(400).json({
      error: "Missing sessionId or apprenantId"
    });
  }

  try {
    // Vérifier que la session existe
    const { data: session, error: sessionError } =
      await supabase
        .from("sessions")
        .select("id, expires_at, ended_at")
        .eq("id", sessionId)
        .maybeSingle();

    if (sessionError || !session) {
      return res.status(404).json({
        error: "Session not found"
      });
    }

    console.log("VERIFICATION SESSION :", {
      id: session.id,
      expires_at: session.expires_at,
      expiration_depassee:
        new Date(session.expires_at) < new Date()
    });

    // Vérifier que la séance est toujours ouverte.
    // Une présence est refusée si la séance est terminée
    // ou si sa durée de validité est dépassée.
    if (
      session.ended_at ||
      new Date(session.expires_at) < new Date()
    ) {
      return res.status(403).json({
        error: "Session expired"
      });
    }

    // Transformer le QR en identifiant apprenant interne
    // Retrouver l'apprenant correspondant au QR scanné
    // dans le référentiel des apprenants.
    const { data: apprenant, error: apprenantError } =
      await supabase
        .from("apprenants")
        .select("id")
        .eq("qr_code", qrCode)
        .maybeSingle();

    console.log(
      "APPRENANT TROUVE :",
      apprenant?.id
    );

    if (apprenantError) {
      console.error(
        "ERREUR RECHERCHE APPRENANT :",
        apprenantError
      );
    }

    // Si l'apprenant n'existe pas, renvoyer une erreur
    if (apprenantError || !apprenant) {
      return res.status(404).json({
        error: "Apprenant introuvable"
      });
    }

    const vraiApprenantId = apprenant.id;

    console.log(
      "QR apprenant validé, ID interne :",
      vraiApprenantId
    );
    
    // Vérifier que l'apprenant fait partie des participants attendus
    // pour cette séance.
    const { data: participation, error: participationError } =
      await supabase
        .from("session_apprenants")
        .select("id")
        .eq("session_id", sessionId)
        .eq("apprenant_id", vraiApprenantId)
        .maybeSingle();

    // Si erreur lors de la vérification de la participation, renvoyer une erreur
    if (participationError) {
      return res.status(500).json({
        error: participationError.message
      });
    }

    // Vérifier que l'apprenant fait partie des participants attendus pour cette séance.
    // V0.9.0 : session_apprenants est générée lors de la création de session
    // à partir des apprenants appartenant au groupe concerné.
    // seuls les apprenants présents dans session_apprenants
    // peuvent émarger à cette séance.
    if (!participation) {
      return res.status(403).json({
        error: "Apprenant non prévu pour cette séance"
      });
    }

    // Vérifier qu'aucune présence n'existe déjà
    // pour cet apprenant dans cette séance.
    const { data: existing } =
      await supabase
        .from("presences")
        .select("id")
        .eq("session_id", sessionId)
        .eq("apprenant_id", vraiApprenantId)
        .maybeSingle();

    if (existing) {
      return res.status(409).json({
        "status": "error",
        "code": "PRESENCE_ALREADY_EXISTS",
        "message": "Présence déjà enregistrée"
      });

    }

    // Créer l'émargement définitif de l'apprenant
    // pour cette séance.
    const { data, error } =
      await supabase
        .from("presences")
        .insert([
          {
            session_id: sessionId,
            apprenant_id: vraiApprenantId,
            type_scan: "QR",
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

    if (error) {
      return res.status(500).json({
        error
      });
    }

    // Retourner la présence créée au frontend
    // pour confirmation du scan
    res.json({
      status: "ok",
      presence: data
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }

});

export default router;