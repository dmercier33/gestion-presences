import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// servir frontend
const frontendPath = path.resolve(process.cwd(), "../frontend");
app.use(express.static(frontendPath));

console.log("FRONTEND SERVED FROM :", frontendPath);

// SUPABASE
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


// HEALTH
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


// ===============================
// CREATE SESSION
// ===============================

app.post("/sessions", async (req, res) => {

  const sessionId = "SESSION_" + Date.now();

  const token = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();


  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        id: sessionId,
        token,
        active: true
      }
    ])
    .select()
    .single();


  if (error) {
    return res.status(500).json({ error });
  }


  res.json({
    sessionId: data.id,
    token: data.token
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


  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});



// ===============================
// SCAN QR PRESENCE
// ===============================

app.post("/api/presences", async (req, res) => {

  const { sessionId, apprenantId } = req.body;


  if (!sessionId || !apprenantId) {
    return res.status(400).json({
      error: "Missing sessionId or apprenantId"
    });
  }


  try {


    // vérifier session

    const { data: session, error: sessionError } =
      await supabase
        .from("sessions")
        .select("id")
        .eq("id", sessionId)
        .maybeSingle();


    if (sessionError || !session) {
      return res.status(404).json({
        error: "Session not found"
      });
    }



    // vérifier inscription

    const { data: allowed, error: allowedError } =
      await supabase
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



    // anti doublon

    const { data: existing } =
      await supabase
        .from("presences")
        .select("id")
        .eq("session_id", sessionId)
        .eq("apprenant_id", apprenantId)
        .maybeSingle();


    if (existing) {
      return res.status(409).json({
        error: "Already registered"
      });
    }



    // insertion

    const { data, error } =
      await supabase
        .from("presences")
        .insert([
          {
            session_id: sessionId,
            apprenant_id: apprenantId,
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



  } catch(err) {

    res.status(500).json({
      error: err.message
    });

  }

});



// ===============================
// APPRENANTS
// ===============================


app.post("/apprenants", async (req,res)=>{

  const { nom, prenom, groupe } = req.body;

  const id = "APP_" + Date.now();


  const {data,error}=await supabase
    .from("apprenants")
    .insert([
      {
        id,
        nom,
        prenom,
        groupe,
        actif:true
      }
    ])
    .select()
    .single();


  if(error){
    return res.status(500).json({error});
  }


  res.json(data);

});



app.get("/apprenants", async(req,res)=>{


  const {data,error}=await supabase
    .from("apprenants")
    .select("*")
    .order("created_at",{ascending:false});


  if(error){
    return res.status(500).json({error});
  }


  res.json(data);

});



// ===============================
// SESSION APPRENANTS
// ===============================


app.post("/session-apprenants", async(req,res)=>{


 const {sessionId, apprenantId}=req.body;


 const id="SA_"+Date.now();


 const {data,error}=await supabase
   .from("session_apprenants")
   .insert([
    {
      id,
      session_id:sessionId,
      apprenant_id:apprenantId
    }
   ])
   .select()
   .single();


 if(error){
   return res.status(500).json({error});
 }


 res.json(data);


});


app.post("/apprenants/:id/qr", async (req,res)=>{

    const id = req.params.id;

    const qrCode = "APP_" + Date.now() + "_" + Math.random()
        .toString(36)
        .substring(2,8);


    const { data, error } = await supabase
        .from("apprenants")
        .update({
            qr_code: qrCode
        })
        .eq("id", id)
        .select();


    if(error){
        return res.status(500).json(error);
    }


    res.json({
        qr_code: qrCode,
        apprenant:data[0]
    });

});

// START

app.listen(
  process.env.PORT || 3000,
  ()=>{
    console.log(
      "API running on port",
      process.env.PORT || 3000
    );
  }
);

