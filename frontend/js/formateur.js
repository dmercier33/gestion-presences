import { createSession } from "./api.js";

let sessionActive = null;
let refreshTimer = null;


async function nouvelleSession() {

    try {

        console.log("Création session...");

        const session = await createSession();

        localStorage.setItem(
            "sessionId",
            session.sessionId
        );

        localStorage.setItem(
    "sessionToken",
    session.token
)       ;

        console.log("Session reçue :", session);

        sessionActive = session;


        // éviter plusieurs timers si on recrée une session
        if (refreshTimer) {
            clearInterval(refreshTimer);
        }

        refreshTimer = setInterval(refreshPresences, 5000);


        localStorage.setItem(
            "session",
            JSON.stringify(session)
        );


        document.getElementById("sessionInfo").innerText =
            `Session créée : ${session.sessionId}`;


        const qrContainer = document.getElementById("qrCanvas");

        qrContainer.innerHTML = "";


        const qrData = JSON.stringify({
            type: "SESSION",
            sessionId: session.sessionId,
            token: session.token
        });

        console.log("VERSION TEST QR SESSION V0.2");

        new QRCode(qrContainer, {
            text: qrData,
            width: 250,
            height: 250
        });

        console.log("QR SESSION généré :", qrData);

    } catch (error) {

        console.error("Erreur création session :", error);

        document.getElementById("sessionInfo").innerText =
            "Erreur création session";
    }
}



window.nouvelleSession = nouvelleSession;



// bouton nouvelle session

document
    .getElementById("btnNewSession")
    .addEventListener(
        "click",
        nouvelleSession
    );





async function refreshPresences() {

    if (!sessionActive) return;


    try {

        const res = await fetch(
            `https://gestion-presences-56vd.onrender.com/presences/${sessionActive.sessionId}`
        );


        const presences = await res.json();

        console.log("PRESENCES RECUES :", presences);

        document.getElementById("presenceCount").innerText =
            `${presences.length} apprenant(s)`;



        document.getElementById("presenceList").innerHTML =

            presences.map(p => `

                <p>
                    ✅ ${p.apprenants.prenom}
                    ${p.apprenants.nom}
                    (${p.apprenants.groupe})
                    -
                    ${new Date(p.created_at).toLocaleTimeString()}
                </p>

            `).join("");



    } catch (err) {

        console.error(
            "Erreur chargement présences",
            err
        );

    }

}
