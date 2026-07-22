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