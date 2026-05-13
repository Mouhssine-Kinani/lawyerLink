const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiRequest(path, options = {}) {
  const { headers: optionHeaders, ...restOptions } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...optionHeaders,
    },
    ...restOptions,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.detail || `Request failed with status ${res.status}`);
  }
  return data;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

export const clientApi = {
  getMyProfile(token) {
    return apiRequest("/users/me", {
      headers: authHeader(token),
    });
  },

  updateProfile(data, token) {
    return apiRequest("/users/me/client", {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  async uploadProfileImage(file, token) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/users/me/image`, {
      method: "POST",
      headers: authHeader(token),
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || `Upload failed with status ${res.status}`);
    }
    return data;
  },

  deleteProfileImage(token) {
    return apiRequest("/users/me/image", {
      method: "DELETE",
      headers: authHeader(token),
    });
  },
};
