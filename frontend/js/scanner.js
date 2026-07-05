
import { sendPresence } from "./api.js";

const qrScanner = new Html5Qrcode("reader");

window.startScan = function () {

  qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    async (decodedText) => {

      const session = JSON.parse(decodedText);

      const apprenantId = document.getElementById("apprenantId").value;

      const res = await sendPresence(
        session.sessionId,
        session.token,
        apprenantId
      );

      document.getElementById("status").innerText =
        res.status === "ok"
          ? "Présence enregistrée ✔"
          : "Erreur ❌";

      qrScanner.stop();
    }
  );
};