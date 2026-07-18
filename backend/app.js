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

app.use((req, res, next) => {
  console.log("REQUETE RECUE :", req.method, req.url);
  next();
});

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


/*
 API Présencia

 Sessions
   POST /sessions *
   GET /sessions/:id ?

 Présences
   POST /api/presences *
   GET /presences/:sessionId *

 Groupes
   GET /groupes *

 Apprenants
   GET /apprenants *
   POST /apprenants *
*/

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
// Elle retourne les informations nécessaires au formateur
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
      active,
      started_at,
      expires_at,
      duration_minutes
    `)
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

if (existingSession) {
  return res.status(200).json({
    status: "existing",
    session: existingSession
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
  status: "created",
  session: data
});
});



// =====================================================
// CONSULTATION DES PRÉSENCES D'UNE SÉANCE
// =====================================================
//
// Rôle :
// Retourne la liste des apprenants présents
// pour affichage côté formateur.
//
// Utilisateur concerné :
// Formateur
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



// =====================================================
// ENREGISTREMENT D'UNE PRÉSENCE
// =====================================================
//
// Rôle :
// Enregistre l'émargement d'un apprenant.
//
// Vérifications :
// - séance existante
// - séance active
// - séance non expirée
// - apprenant reconnu par son QR
// - absence de doublon
//
// Utilisateur concerné :
// Formateur
app.post("/api/presences", async (req, res) => {

  const { sessionId, apprenantId: qrCode } = req.body;

  console.log("===== API PRESENCES =====");
  console.log("sessionId :", sessionId);
  console.log("qrCode    :", qrCode);

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

    console.log("APPRENANT TROUVE :", apprenant);
    console.log("ERREUR APPRENANT :", apprenantError);

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



// =====================================================
// CRÉATION D'UN APPRENANT
// =====================================================
//
// Rôle :
// Crée un apprenant dans le référentiel Présencia.
//
// Version actuelle :
// Création simple nom/prénom/groupe.
//
// Évolution prévue v1.0 :
// - groupe_id au lieu de groupe texte
// - génération automatique du QR
//
// Utilisateur concerné :
// Administrateur
app.post("/apprenants", async (req, res) => {

  const { nom, prenom, groupe_id } = req.body;

  if (!nom || !prenom || !groupe_id) {
    return res.status(400).json({
      error: "nom, prenom et groupe_id obligatoires"
    });
  }

  const id = "APP_" + Date.now();

  const { data, error } = await supabase
    .from("apprenants")
    .insert([
      {
        id,
        nom,
        prenom,
        groupe_id,
        actif: true
      }
    ])
    .select()
    .single();
    

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json(data);

});

// =================================
// LISTE DES APPRENANTS
// =================================
app.get("/apprenants", async (req, res) => {

  const { data, error } = await supabase
    .from("apprenants")
    .select(`
      id,
      nom,
      prenom,
      qr_code,
      actif,
      created_at,
      groupe_id,
      groupes (
      id,
      code,
      libelle
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json(data);

});

// =================================
// Rôle :
// Générer ou régénérer le badge QR d'un apprenant.
// Utilisateur concerné :
// Administrateur
// =================================
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

// ===================
// LISTE DES GROUPES
// ===================
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
