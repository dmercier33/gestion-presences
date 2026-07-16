import { API_URL } from "./config.js";


/**
 * Création d'une session côté formateur
 */
export async function createSession({
    groupe_id,
    duration_minutes
}) {

    const res = await fetch(`${API_URL}/sessions`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            groupe_id,
            duration_minutes
        })

    });


    if (!res.ok) {

        const error = await res.json();

        throw new Error(
            error.message || "Erreur création session"
        );

    }


    const result = await res.json();


    console.log(
        "SESSION CREEE :",
        result
    );


    return result;
}



/**
 * Enregistrement d'une présence après scan QR
 */
export async function registerPresence(sessionId, apprenantId) {

    console.log("ENVOI PRESENCE :", {
    sessionId,
    apprenantId
    });

    const res = await fetch(`${API_URL}/api/presences`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sessionId,
            apprenantId
        })
    });


    return await res.json();
}