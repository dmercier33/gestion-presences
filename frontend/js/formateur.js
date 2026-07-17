import { API_URL } from "./config.js";
import { openSession } from "./api.js";

let sessionCourante = null;
let refreshTimer = null;

// formateur.js pilote l'interface du formateur pendant le déroulement d'une session.
// formateur.js ne contient que la logique de l'écran formateur.

// ===============================
// CHARGEMENT DES GROUPES
// ===============================

async function chargerGroupes() {

    try {

        const res = await fetch(`${API_URL}/groupes`);

        if (!res.ok) {

            throw new Error("Erreur chargement groupes");
        }

        const groupes = await res.json();

        console.log("GROUPES RECUS :", groupes);

        const select = document.getElementById("selectGroupe");

        select.innerHTML = `
            <option value="">
                -- Choisir un groupe --
            </option>
        `;

        groupes.forEach(groupe => {
            const option = document.createElement("option");
            option.value = groupe.id;
            option.textContent = groupe.libelle;
            select.appendChild(option);
        });


    } catch (error) {
        console.error(
            "Erreur chargement groupes :",
            error
        );
    }

}

async function nouvelleSession() {

    try {

        const groupe_id =
            document.getElementById("selectGroupe").value;

        const duration_minutes =
            Number(
                document.getElementById("duration").value
            );

        if (!groupe_id) {
            alert("Veuillez choisir un groupe");
            return;
        }

        console.log("Création session :", {
            groupe_id,
            duration_minutes
        });

        const session = await openSession({
            groupe_id,
            duration_minutes
        });

        localStorage.setItem(
            "sessionId",
            session.sessionId
        );

        localStorage.setItem(
    "sessionToken",
    session.token
)       ;

        console.log("Session reçue :", session);

        sessionCourante = session;

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
            `Séance ouverte pour le groupe : ${groupe_id}`;

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

async function refreshPresences() {

    if (!sessionCourante) return;


    try {

        const res = await fetch(
            `${API_URL}/presences/${sessionCourante.sessionId}`
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

window.nouvelleSession = nouvelleSession;

// bouton nouvelle session
document
    .getElementById("btnNewSession")
    .addEventListener(
        "click",
        nouvelleSession
    );

chargerGroupes();
