const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("lawyerlink_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || `Request failed with status ${res.status}`);
  }

  return data;
}

export const adminApi = {
  getDashboardStats: async () => {
    return apiRequest("/admin/dashboard");
  },
  getDashboardCharts: async () => {
    return apiRequest("/admin/dashboard/charts");
  },
  getClients: async (skip = 0, limit = 15) => {
    return apiRequest(`/admin/clients?skip=${skip}&limit=${limit}`);
  },
  getLawyers: async (skip = 0, limit = 15) => {
    return apiRequest(`/admin/lawyers?skip=${skip}&limit=${limit}`);
  },
  getReservations: async (status = null) => {
    let path = "/admin/reservations";
    if (status) path += `?status=${status}`;
    return apiRequest(path);
  },
};
