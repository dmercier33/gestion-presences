import express from "express";
import supabase from "../database/supabase.js";

const router = express.Router();

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
router.post("/", async (req, res) => {

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
router.get("/", async (req, res) => {

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
router.post("/:id/qr", async (req, res) => {

  const id = req.params.id;

  // Récupérer l'apprenant existant
  const { data: apprenant, error: apprenantError } =
    await supabase
      .from("apprenants")
      .select("*")
      .eq("id", id)
      .single();


  if (apprenantError) {
    return res.status(500).json({
      error: apprenantError.message
    });
  }


  if (!apprenant) {
    return res.status(404).json({
      error: "Apprenant introuvable"
    });
  }


  let qrCode = apprenant.qr_code;


  // Création du QR uniquement s'il n'existe pas encore
  if (!qrCode) {

    qrCode =
      "APP_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .substring(2, 8);


    const { error: updateError } =
      await supabase
        .from("apprenants")
        .update({
          qr_code: qrCode
        })
        .eq("id", id);


    if (updateError) {
      return res.status(500).json({
        error: updateError.message
      });
    }

  }


  const qrPayload = {
    type: "APPRENANT",
    version: 1,
    qrCode: qrCode
  };


  res.json({
    qr_code: qrCode,
    qr_payload: qrPayload,
    apprenant
  });

});

export default router;