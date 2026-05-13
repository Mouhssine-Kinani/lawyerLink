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

export const reviewApi = {
  getMyReviews(token) {
    return apiRequest("/reviews/me", {
      headers: authHeader(token),
    });
  },

  createReview(data, token) {
    return apiRequest("/reviews/", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  updateReview(reviewId, data, token) {
    return apiRequest(`/reviews/${reviewId}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  getMyReviewForLawyer(lawyerId, token) {
    return apiRequest(`/reviews/me/lawyer/${lawyerId}`, {
      headers: authHeader(token),
    });
  },

  canReviewLawyer(lawyerId, token) {
    return apiRequest(`/reviews/me/can-review/${lawyerId}`, {
      headers: authHeader(token),
    });
  },

  deleteReview(reviewId, token) {
    return apiRequest(`/reviews/${reviewId}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },
};
