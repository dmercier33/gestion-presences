import express from "express";
import supabase from "../database/supabase.js";

const router = express.Router();

// ===================
// LISTE DES GROUPES
// ===================
//
// Retourne les groupes disponibles
// pour les écrans d'administration
// et d'affectation des apprenants.
router.get("/", async (req, res) => {

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

export default router;
