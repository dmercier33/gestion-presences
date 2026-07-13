import { createSession } from "./api.js";

let sessionActive = null;


async function nouvelleSession() {

    try {

        console.log("Création session...");

        const session = await createSession();

        console.log("Session reçue :", session);

        sessionActive = session;

        localStorage.setItem(
            "session",
            JSON.stringify(session)
        );


        document.getElementById("sessionInfo").innerText =
            `Session créée : ${session.sessionId}`;


        const qrContainer = document.getElementById("qrCanvas");

        qrContainer.innerHTML = "";


        const qrData = JSON.stringify({
            sessionId: session.sessionId,
            token: session.token
        });


        new QRCode(qrContainer, {
            text: qrData,
            width: 250,
            height: 250
        });


    } catch (error) {

        console.error("Erreur création session :", error);

        document.getElementById("sessionInfo").innerText =
            "Erreur création session";
    }
}


window.nouvelleSession = nouvelleSession;


// branchement bouton
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


    document.getElementById("presenceCount").innerText =
      `${presences.length} apprenant(s)`;


    document.getElementById("presenceList").innerHTML =
      presences.map(p => `
        <p>
          ✅ ${p.apprenant_id}
          - ${new Date(p.created_at).toLocaleTimeString()}
        </p>
      `).join("");


  } catch(err) {

    console.error("Erreur chargement présences", err);

  }

}
