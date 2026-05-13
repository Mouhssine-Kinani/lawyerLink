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

export const reservationApi = {
  createReservation(data, token) {
    return apiRequest("/reservations/", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  getReservations(status, limit, token) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (limit) params.append("limit", limit);
    const qs = params.toString();
    return apiRequest(`/reservations/${qs ? `?${qs}` : ""}`, {
      headers: authHeader(token),
    });
  },

  getReservation(id, token) {
    return apiRequest(`/reservations/${id}`, {
      headers: authHeader(token),
    });
  },

  updateReservation(id, data, token) {
    return apiRequest(`/reservations/${id}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  cancelReservation(id, token) {
    return apiRequest(`/reservations/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  getReservationsWithClients(status, limit, token) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (limit) params.append("limit", limit);
    const qs = params.toString();
    return apiRequest(`/reservations/with-clients${qs ? `?${qs}` : ""}`, {
      headers: authHeader(token),
    });
  },

  getLawyerAvailability(lawyerId, dateStr) {
    return apiRequest(`/lawyer/public/${lawyerId}/availability?date=${dateStr}`);
  },
};
