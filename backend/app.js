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
import supabase from "./database/supabase.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import groupeRoutes from "./routes/groupes.js";
import apprenantRoutes from "./routes/apprenants.js";
import presenceRoutes from "./routes/presences.js";

dotenv.config({
  path: process.env.NODE_ENV === "test"
    ? ".env.test"
    : ".env"
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/groupes", groupeRoutes);
app.use("/api/apprenants", apprenantRoutes);
app.use("/api/presences", presenceRoutes);
app.use("/api/sesions", sessionRoutes);

// Middleware de journalisation des requêtes.
// Utile pour le diagnostic en environnement de déploiement.
app.use((req, res, next) => {
  next();
});

// HEALTH
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Servir le frontend statique.
// Le backend Express expose également l'application web.
const frontendPath = path.resolve(process.cwd(), "../frontend");
app.use(express.static(frontendPath));


// Export de l'application Express.
// Le démarrage du serveur est géré par le point d'entrée.
export default app;

