import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config({
  path: process.env.NODE_ENV === "test"
    ? ".env.test"
    : ".env"
});



console.log(
  "URL Supabase =",
  process.env.SUPABASE_URL
);

console.log(
  "KEY Supabase présente =",
  !!process.env.SUPABASE_KEY
);

console.log(
  "Longueur KEY =",
  process.env.SUPABASE_KEY?.length
);

const app = express();

app.use(cors());
app.use(express.json());

// servir frontend
const frontendPath = path.resolve(process.cwd(), "../frontend");
app.use(express.static(frontendPath));



// SUPABASE
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

console.log(
  "SUPABASE_URL OK :",
  process.env.SUPABASE_URL
);


console.log(
  "SUPABASE_KEY présente :",
  !!process.env.SUPABASE_KEY
);

console.log(
  "SUPABASE_KEY début :",
  process.env.SUPABASE_KEY?.substring(0, 10)
);

// HEALTH
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


// ===============================
// LISTE DES GROUPES
// ===============================
app.get("/groupes", async (req, res) => {

  const { data, error } = await supabase
    .from("groupes")
    .select("id, libelle")
    .order("libelle");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);

});

// ===============================
// CREATE SESSION
// ===============================
app.post("/sessions", async (req, res) => {

  const {
    groupe_id,
    duration_minutes = 120
  } = req.body;

  if (!groupe_id) {
    return res.status(400).json({
      error: "groupe_id obligatoire"
    });
  }

  //   Vérifier qu'il n'y a pas déjà une session active pour ce groupe
  const now = new Date();
  const { data: existingSession, error: existingError } =
    await supabase
      .from("sessions")
      .select("id, expires_at, active, ended_at")
      .eq("groupe_id", groupe_id)
      .eq("active", true)
      .is("ended_at", null)
      .gt("expires_at", now.toISOString())
      .maybeSingle();


  if (existingError) {
    return res.status(500).json({
      error: existingError.message
    });
  }

  // Si une session existe déjà, renvoyer un message d'erreur
  if (existingSession) {

    return res.status(409).json({
      error: "Une session est déjà ouverte pour ce groupe.",
      sessionId: existingSession.id
    });

  }

  // Création nouvelle session
  const sessionId = "SESSION_" + Date.now();

  const token = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  const createdAt = new Date();

  const expiresAt = new Date(
    createdAt.getTime() + duration_minutes * 60000
  );

  console.log("OBJET ENVOYE A SUPABASE :", {
    id: sessionId,
    token,
    groupe_id,
    duration_minutes,
    started_at: createdAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  });

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

  res.json({
    sessionId: data.id,
    token: data.token,
    expires_at: data.expires_at
  });
});



// ===============================
// LECTURE PRESENCES SESSION
// ===============================
app.get("/presences/:sessionId", async (req, res) => {

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
          groupe
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


// ===============================
// SCAN QR PRESENCE
// ===============================
app.post("/api/presences", async (req, res) => {

  const { sessionId, apprenantId: qrCode } = req.body;

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
        .select("id, expires_at, ended_at, active")
        .eq("id", sessionId)
        .maybeSingle();

    if (sessionError || !session) {
      return res.status(404).json({
        error: "Session not found"
      });
    }

    console.log("VERIFICATION SESSION :", {
      id: session.id,
      active: session.active,
      ended_at: session.ended_at,
      expires_at: session.expires_at,
      maintenant: new Date().toISOString(),
      expiration_depassee: new Date(session.expires_at) < new Date(),
      now: new Date().toISOString()
    });

    // Vérifier que la session est active et non expirée
    if (
      !session.active ||
      session.ended_at ||
      new Date(session.expires_at) < new Date()
    ) {
      return res.status(403).json({
        error: "Session expired"
      });
    }

    // Transformer le QR en identifiant apprenant interne
    const { data: apprenant, error: apprenantError } =
      await supabase
        .from("apprenants")
        .select("id")
        .eq("qr_code", qrCode)
        .maybeSingle();

    // Si l'apprenant n'existe pas, renvoyer une erreur
    if (apprenantError || !apprenant) {
      return res.status(404).json({
        error: "Apprenant introuvable"
      });
    }

    const vraiApprenantId = apprenant.id;

    console.log(
      "QR apprenant :",
      qrCode,
      "=> ID interne :",
      vraiApprenantId
    );

    // Vérifier si l'apprenant est déjà inscrit à la session
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

    // Si l'apprenant n'est pas encore inscrit à la session, l'inscrire
    if (!participation) {
      const participationId =
        "SA_" + Date.now();

      const { error: insertParticipationError } =
        await supabase
          .from("session_apprenants")
          .insert([
            {
              id: participationId,
              session_id: sessionId,
              apprenant_id: vraiApprenantId
            }
          ]);

      if (insertParticipationError) {
        return res.status(500).json({
          error: insertParticipationError.message
        });

      }

    }

    // Vérifier doublon présence
    const { data: existing } =
      await supabase
        .from("presences")
        .select("id")
        .eq("session_id", sessionId)
        .eq("apprenant_id", vraiApprenantId)
        .maybeSingle();

    if (existing) {
      return res.status(409).json({
        error: "Already registered"
      });

    }

    // Enregistrer présence
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



// ===============================
// APPRENANTS
// ===============================
app.post("/apprenants", async (req, res) => {

  const { nom, prenom, groupe } = req.body;
  const id = "APP_" + Date.now();

  const { data, error } = await supabase
    .from("apprenants")
    .insert([
      {
        id,
        nom,
        prenom,
        groupe,
        actif: true
      }
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error });
  }

  res.json(data);

});


// ===============================
// GET SESSION APPRENANTS
// ===============================
app.get("/apprenants", async (req, res) => {

  const { data, error } = await supabase
    .from("apprenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error });
  }

  res.json(data);

});



// ===============================
// SESSION APPRENANTS
// ===============================
app.post("/session-apprenants", async (req, res) => {

  const { sessionId, apprenantId } = req.body;
  const id = "SA_" + Date.now();

  const { data, error } = await supabase
    .from("session_apprenants")
    .insert([
      {
        id,
        session_id: sessionId,
        apprenant_id: apprenantId
      }
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error });
  }

  res.json(data);

});


// ===============================
// QR APPRENANTS
// ===============================
app.post("/apprenants/:id/qr", async (req, res) => {

  const id = req.params.id;

  const qrCode =
    "APP_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .substring(2, 8);

  const { data, error } = await supabase
    .from("apprenants")
    .update({
      qr_code: qrCode
    })
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({
      error: "Apprenant introuvable"
    });

  }

  const qrPayload = {
    type: "APPRENANT",
    version: 1,
    qrCode: qrCode
  };

  res.json({
    qr_code: qrCode,
    qr_payload: qrPayload,
    apprenant: data[0]
  });

});

// ===============================
// LISTE DES GROUPES
// ===============================
app.get("/groupes", async (req, res) => {

  try {
    const { data, error } = await supabase
      .from("groupes")
      .select("id, libelle")
      .order("id");

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }

});

// START
export default app;
