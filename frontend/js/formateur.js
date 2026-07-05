import { createSession } from "./api.js";

window.nouvelleSession = async function () {
  const session = await createSession();

  // sauvegarde session pour scan
  localStorage.setItem("session", JSON.stringify(session));

  // affichage texte
  document.getElementById("result").innerText =
    `Session: ${session.sessionId}`;

  // QR code réel
  QRCode.toCanvas(document.getElementById("qr"), JSON.stringify(session), {
    width: 250
  });
};