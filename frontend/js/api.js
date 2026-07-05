const API_URL = "https://gestion-presences-56vd.onrender.com";

/**
 * Crée une nouvelle session
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

    return await res.json();
}

/**
 * Enregistre une présence après scan QR
 */
export async function sendPresence({ sessionId, token, apprenantId }) {
    const res = await fetch(`${API_URL}/presence`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sessionId,
            token,
            apprenantId
        })
    });

    if (!res.ok) {
        throw new Error("Erreur enregistrement présence");
    }

    return await res.json();
}