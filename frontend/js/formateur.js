import { createSession } from "./api.js";

window.nouvelleSession = async function () {
  const session = await createSession();

  document.getElementById("result").innerText =
    `Session: ${session.sessionId}`;

  const qrData = JSON.stringify(session);

  document.getElementById("qr").innerText = qrData;
};