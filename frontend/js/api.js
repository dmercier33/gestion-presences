const API_URL = "https://gestion-presences-56vd.onrender.com";


/**
 * Création d'une session côté formateur
 */
export async function createSession() {

    const res = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });


    if (!res.ok) {
        throw new Error("Erreur création session");
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