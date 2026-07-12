import { createSession } from "./api.js";

let sessionActive = null;

const btn = document.getElementById("btnNewSession");

btn.addEventListener("click", async () => {

    try {

        const session = await createSession();

        sessionActive = session;

        localStorage.setItem(
            "session",
            JSON.stringify(session)
        );

        document.getElementById("sessionInfo").innerText =
            `Session créée : ${session.sessionId}`;

        const qrContainer = document.getElementById("qrCanvas");

        qrContainer.innerHTML = "";

        const qrData = `${session.sessionId}|${session.token}`;

        new QRCode(qrContainer, {
            text: qrData,
            width: 250,
            height: 250
        });
    } catch (err) {

        console.error(err);

        document.getElementById("sessionInfo").innerText =
            "Erreur création session";
    }
});
