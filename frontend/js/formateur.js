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

        const canvas = document.getElementById("qrCanvas");

        const qrData = `${session.sessionId}|${session.token}`;

        console.log("QRCode disponible :", typeof QRCode);
        
        QRCode.toCanvas(
            canvas,
            qrData,
            function(error) {
                if (error) {
                    console.error(error);
                }
            }
        );

    } catch (err) {

        console.error(err);

        document.getElementById("sessionInfo").innerText =
            "Erreur création session";
    }
});
