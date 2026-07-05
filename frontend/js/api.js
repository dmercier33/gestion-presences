const API_URL = "https://TON-SERVICE.onrender.com";

export async function createSession() {
  const res = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });

  return await res.json();
}

export async function sendPresence(sessionId, token, apprenantId) {
  const res = await fetch(`${API_URL}/presence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, token, apprenantId })
  });

  return await res.json();
}