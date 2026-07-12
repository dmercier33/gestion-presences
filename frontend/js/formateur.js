import { createSession } from "./api.js";

// stockage session active côté formateur
let sessionActive = null;

/**
 * Création d'une nouvelle session + génération QR
 */
window.nouvelleSession = async function () {
  try {
    // 1. appel backend
    const session = await createSession();

    sessionActive = session;

    // 2. sauvegarde locale (utile pour debug / scan)
    localStorage.setItem("session", JSON.stringify(session));

    // 3. affichage ID session
    document.getElementById("result").innerText =
      `Session créée : ${session.sessionId}`;

    // 4. génération QR code (canvas)
    const canvas = document.getElementById("qrcode");

    if (!canvas) {
      console.error("Canvas QR code introuvable");
      return;
    }

    // format QR (simple et standard)
    const qrData = `${session.sessionId}|${session.token}`;

    QRCode.toCanvas(canvas, qrData, function (error) {
      if (error) console.error(error);
    });

  } catch (err) {
    console.error("Erreur création session :", err);
    document.getElementById("result").innerText =
      "Erreur création session";
  }
};

/**
 * (optionnel) reset session
 */
window.resetSession = function () {
  sessionActive = null;
  localStorage.removeItem("session");
  document.getElementById("result").innerText = "Session réinitialisée";
};
