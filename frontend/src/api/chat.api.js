const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function request(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.detail || `Request failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const chatApi = {
  listSessions(token) {
    return request("/chat/sessions", token);
  },

  createSession(token) {
    return request("/chat/session", token, { method: "POST" });
  },

  sendMessage(sessionId, content, token) {
    return request(`/chat/session/${sessionId}/message`, token, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  getHistory(sessionId, token) {
    return request(`/chat/session/${sessionId}/history`, token);
  },

  deleteSession(sessionId, token) {
    return request(`/chat/session/${sessionId}`, token, { method: "DELETE" });
  },

  getSessionRecommendations(sessionId, token) {
    return request(`/recommendations/session/${sessionId}/details`, token);
  },
};
