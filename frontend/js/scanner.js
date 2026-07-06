import { registerPresence } from "./api.js";

const status = document.getElementById("status");

// ⚠️ IMPORTANT : camera arrière mobile
const config = {
  fps: 10,
  qrbox: 250
};

const scanner = new Html5Qrcode("reader");

scanner.start(
  { facingMode: "environment" },
  config,
  async (decodedText) => {
    try {
      const data = JSON.parse(decodedText);

      if (!data.sessionId) {
        status.innerText = "QR invalide ❌";
        return;
      }

      const apprenantId =
        localStorage.getItem("apprenantId") || "test-user";

      const res = await registerPresence(data.sessionId, apprenantId);

      if (res.status === "ok") {
        status.innerText = "Présence validée ✅";
      } else {
        status.innerText = "Erreur enregistrement ❌";
      }

      console.log(res);

    } catch (err) {
      console.error(err);
      status.innerText = "Erreur scan ❌";
    }
  },
  (error) => {
    // scan en cours (silencieux)
  }
);