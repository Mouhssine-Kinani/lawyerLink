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

export const lawyerApi = {
  getLawyers(params = {}) {
    const query = new URLSearchParams();
    if (params.specialty) query.append("specialty", params.specialty);
    if (params.city) query.append("city", params.city);
    if (params.min_rate) query.append("min_rate", params.min_rate);
    if (params.max_rate) query.append("max_rate", params.max_rate);
    if (params.min_rating) query.append("min_rating", params.min_rating);
    if (params.sort_by) query.append("sort_by", params.sort_by);
    if (params.limit) query.append("limit", params.limit);
    const qs = query.toString();
    return apiRequest(`/lawyer/public${qs ? `?${qs}` : ""}`);
  },

  getLawyerById(id) {
    return apiRequest(`/lawyer/public/${id}`);
  },

  getLawyerReviews(lawyerId, limit = 50) {
    return apiRequest(`/reviews/lawyer/${lawyerId}?limit=${limit}`);
  },

  updateProfile(data, token) {
    return apiRequest("/lawyer/me", {
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

  getMyProfile(token) {
    return apiRequest("/users/me", {
      headers: authHeader(token),
    });
  },
};
