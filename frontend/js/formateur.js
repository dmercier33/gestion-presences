import { createSession } from "./api.js";

// stockage session active côté formateur
let sessionActive = null;


/**
 * Création d'une nouvelle session + génération QR
 */
window.nouvelleSession = async function () {

  try {

    // 1. création session backend
    const session = await createSession();

    sessionActive = session;

    // 2. sauvegarde locale
    localStorage.setItem(
      "session",
      JSON.stringify(session)
    );

    // 3. affichage information session
    document.getElementById("sessionInfo").innerText =
      `Session créée : ${session.sessionId}`;


    // 4. préparation données QR
    const qrData = JSON.stringify({
      sessionId: session.sessionId,
      token: session.token
    });


    // 5. génération QR avec qrcodejs
    const qrContainer = document.getElementById("qrCanvas");

    qrContainer.innerHTML = "";

    new QRCode(qrContainer, {
      text: qrData,
      width: 250,
      height: 250
    });


  } catch (err) {

    console.error("Erreur création session :", err);

    document.getElementById("sessionInfo").innerText =
      "Erreur création session";
  }
};


/**
 * Reset session locale
 */
window.resetSession = function () {

  sessionActive = null;

  localStorage.removeItem("session");

  document.getElementById("sessionInfo").innerText =
    "Aucune session";

  document
  .getElementById("btnNewSession")
  .addEventListener("click", nouvelleSession);

  document.getElementById("qrCanvas").innerHTML = "";
};
