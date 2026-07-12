import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// servir le frontend
const frontendPath = path.resolve(process.cwd(), "../frontend");
app.use(express.static(frontendPath));

// 🔗 SUPABASE
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
  
// 🟢 HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🟢 CREATE SESSION
app.post("/sessions", async (req, res) => {

  const sessionId = "SESSION_" + Date.now();
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();

  const { error } = await supabase.from("sessions").insert([
    {
      id: sessionId,
      token,
      active: true
    }
  ]);

  if (error) {
    return res.status(500).json({ error });
  }

  res.json({
    sessionId,
    token
  });
});


// 🟢 GET SESSION
app.get("/sessions/:id", async (req, res) => {

  const { id } = req.params;

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error });
  }

  res.json(data);
});


// 🟢 PRESENCE (SCAN QR)
app.post("/api/presences", async (req, res) => {
  const { sessionId, apprenantId } = req.body;

  // 1. validation inputs
  if (!sessionId || !apprenantId) {
    return res.status(400).json({ error: "Missing sessionId or apprenantId" });
  }

  try {
    // 2. vérifier que la session existe
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      return res.status(404).json({ error: "Session not found" });
    }

// 3. vérifier que l'apprenant est inscrit à la session
const { data: allowed, error: allowedError } = await supabase
  .from("session_apprenants")
  .select("id")
  .eq("session_id", sessionId)
  .eq("apprenant_id", apprenantId)
  .maybeSingle();

if (allowedError) {
  return res.status(500).json({
    error: allowedError.message
  });
}

if (!allowed) {
  return res.status(403).json({
    error: "Apprenant non autorisé dans cette session"
  });
}

    // 4. anti double présence
    const { data: existing } = await supabase
      .from("presences")
      .select("id")
      .eq("session_id", sessionId)
      .eq("apprenant_id", apprenantId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: "Already registered" });
    }

    // 5. insertion présence
    const { data, error } = await supabase
      .from("presences")
      .insert([
        {
          session_id: sessionId,
          apprenant_id: apprenantId,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error });
    }

    // 6. réponse clean
    res.json({
      status: "ok",
      presence: data
    });

  } catch (err) {
    res.status(500).json({ error: "server error", details: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("API running on port", process.env.PORT || 3000);
});

app.post("/apprenants", async (req, res) => {
  const { nom, prenom, email } = req.body;

  const id = "APP_" + Date.now();

  const { data, error } = await supabase
    .from("apprenants")
    .insert([
      {
        id,
        nom,
        prenom,
        email
      }
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error });
  }

  res.json(data);
});

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

app.get("/apprenants/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("apprenants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error });
  }

  res.json(data);
});

// 🟢 ASSIGN APPRENANT TO SESSION
app.post("/session-apprenants", async (req, res) => {

  const { sessionId, apprenantId } = req.body;

  if (!sessionId || !apprenantId) {
    return res.status(400).json({
      error: "Missing sessionId or apprenantId"
    });
  }

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
