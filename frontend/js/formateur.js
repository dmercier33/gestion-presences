import { API_URL } from "./config.js";
import { openSession } from "./api.js";

console.log("FORMATEUR.JS CHARGE");

let sessionCourante = null;
let refreshTimer = null;

// formateur.js pilote l'interface du formateur pendant le déroulement d'une session.
// formateur.js ne contient que la logique de l'écran formateur.

// ===============================
// CHARGEMENT DES GROUPES
// ===============================

async function chargerGroupes() {

    try {

        const res = await fetch(`${API_URL}/api/groupes`);

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

// ===============================
// OUVERTURE D'UNE SEANCE
// ===============================

async function ouvrirSeance() {

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

        console.log("Ouvrir séance :", {
            groupe_id,
            duration_minutes
        });

        const resultat = await openSession({
            groupe_id,
            duration_minutes
        });

        const session = resultat.session;

        if (resultat.status === "existing") {

            console.log(
                "Séance existante reprise"
            );

        }

        localStorage.setItem(
            "sessionId",
            session.sessionId
        );

        localStorage.setItem(
            "sessionToken",
            session.token
        );

        console.log("Session reçue :", session);

        sessionCourante = session;

        if (refreshTimer) {
            clearInterval(refreshTimer);
        }

        refreshTimer = setInterval(
            refreshPresences,
            5000
        );

        localStorage.setItem(
            "session",
            JSON.stringify(session)
        );

        let message;

        if (resultat.status === "existing") {

            message =
                `Séance existante reprise pour le groupe : ${groupe_id}`;

        } else {

            message =
                `Séance ouverte pour le groupe : ${groupe_id}`;

        }

        document.getElementById("sessionInfo").innerText =
            message;

        const qrContainer =
            document.getElementById("qrCanvas");

        qrContainer.innerHTML = "";

        const qrData = JSON.stringify({
            type: "SESSION",
            sessionId: session.id,
            token: session.token
        });

        new QRCode(qrContainer, {
            text: qrData,
            width: 250,
            height: 250
        });

        console.log(
            "QR SESSION généré :",
            qrData
        );

    } catch (error) {

        console.error(
            "Erreur ouverture séance :",
            error
        );

        document.getElementById("sessionInfo").innerText =
            "Erreur ouverture séance";

    }

}

// ===============================
// RAFRAICHISSEMENT DES PRESENCES
// ===============================

async function refreshPresences() {

    if (!sessionCourante) return;

    try {

        console.log(
            "RAFRAICHISSEMENT PRESENCES SEANCE :",
            sessionCourante.id
        );

        const res = await fetch(
            `${API_URL}/api/presences/${sessionCourante.id}`
        );

        const presences = await res.json();

        console.log(
            "PRESENCES RECUES :",
            presences
        );

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

// ===============================
// INITIALISATION
// ===============================

window.ouvrirSeance = ouvrirSeance;

const bouton =
    document.getElementById("btnNewSession");

bouton.addEventListener(
    "click",
    ouvrirSeance
);

chargerGroupes();

console.log("FIN FORMATEUR.JS ATTEINTE");