import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
app.post("/presence", async (req, res) => {

  const { sessionId, token, apprenantId } = req.body;

  // 1. vérifier session
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session || session.token !== token) {
    return res.status(401).json({ error: "invalid session" });
  }

  // 2. insert présence
  const { error } = await supabase.from("presences").insert([
    {
      session_id: sessionId,
      apprenant_id: apprenantId
    }
  ]);

  if (error) {
    return res.status(500).json({ error });
  }

  res.json({ status: "ok" });
});


// 🚀 START
app.listen(process.env.PORT || 3000, () => {
  console.log("API running");
});