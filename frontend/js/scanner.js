import { sendPresence } from "./api.js";

window.validerScan = async function () {

  const apprenantId = document.getElementById("apprenantId").value;

  // simulation QR (plus tard vrai scan caméra)
  const qr = JSON.parse(localStorage.getItem("session"));

  const res = await sendPresence(
    qr.sessionId,
    qr.token,
    apprenantId
  );

  document.getElementById("status").innerText =
    res.status === "ok" ? "Présence enregistrée" : "Erreur";
};