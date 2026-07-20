/*
 API Présencia

 Sessions
   POST api/sessions 

 Présences
   POST /api/presences 
   GET /api/presences/:sessionId 

 Groupes
   GET /api/groupes 

 Apprenants
   GET /api/apprenants 
   POST /api/apprenants 
*/

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config({
  path: process.env.NODE_ENV === "test"
    ? ".env.test"
    : ".env"
});


const app = express();

app.use(cors());
app.use(express.json());

// Middleware de journalisation des requêtes.
// Utile pour le diagnostic en environnement de déploiement.
app.use((req, res, next) => {
  next();
});


// Client Supabase utilisé par les routes API.
// La clé serveur est chargée depuis les variables d'environnement.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// HEALTH
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


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
app.post("/api/sessions", async (req, res) => {

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
app.get("/api/presences/:sessionId", async (req, res) => {

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
app.post("/api/presences", async (req, res) => {

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



// =====================================================
// CRÉATION D'UN APPRENANT
// =====================================================
//
// Rôle :
// Crée un apprenant dans le référentiel Présencia.
//
// Version actuelle :
// Création simple nom/prénom/groupe_id.
//
// Évolution prévue :
// - gestion avancée du cycle de vie apprenant
// - gestion des changements de groupe
// - automatisation complète de l'administration apprenant
//
// Utilisateur concerné :
// Administrateur
app.post("/api/apprenants", async (req, res) => {

  const { nom, prenom, groupe_id } = req.body;

  if (!nom || !prenom || !groupe_id) {
    return res.status(400).json({
      error: "nom, prenom et groupe_id obligatoires"
    });
  }

  // Génération d'un identifiant interne unique.
  // L'identifiant QR sera géré séparément.
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
//
// Retourne le référentiel des apprenants
// avec leurs informations de groupe.
// Utilisé par les écrans d'administration.
app.get("/api/apprenants", async (req, res) => {

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

// Rôle :
// Générer ou régénérer le QR d'identification
// associé à un apprenant.
//
// Le QR est utilisé lors du scan de présence
// afin de retrouver l'apprenant concerné.
//
// Utilisateur concerné :
// Administrateur
app.post("/api/apprenants/:id/qr", async (req, res) => {

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

  // Le payload QR contient les informations nécessaires
  // au scanner pour identifier le type de QR
  // et retrouver l'apprenant correspondant.
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
//
// Retourne les groupes disponibles
// pour les écrans d'administration
// et d'affectation des apprenants.
app.get("/api/groupes", async (req, res) => {

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

// Servir le frontend statique.
// Le backend Express expose également l'application web.
const frontendPath = path.resolve(process.cwd(), "../frontend");
app.use(express.static(frontendPath));


// Export de l'application Express.
// Le démarrage du serveur est géré par le point d'entrée.
export default app;

