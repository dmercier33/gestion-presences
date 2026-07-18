import { API_URL } from "./config.js";


/**
 * Ouverture d'une séance côté formateur
 */
/**
 * Ouverture d'une séance côté formateur
 */
export async function openSession({
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
            error.error || "Erreur ouverture séance"
        );
    }


    const result = await res.json();

    console.log(
        "REPONSE OUVERTURE SEANCE :",
        result
    );

    return result;
}


/**
 * Enregistrement d'une présence après scan QR
 */
export async function validatePresence(sessionId, apprenantId) {

    console.log("ENVOI PRESENCE :", {
        sessionId,
        apprenantId
    });

    const res = await fetch(`${API_URL}/presences`, {
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