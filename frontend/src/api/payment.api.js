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

export const paymentApi = {
  createSubscriptionIntent: async (plan = "pro") => {
    return apiRequest(`/payments/subscription?plan=${plan}`, { method: "POST" });
  },

  createBoostIntent: async (boostLevel) => {
    return apiRequest(`/payments/boost?boost_level=${boostLevel}`, { method: "POST" });
  },

  getPaymentHistory: async () => {
    return apiRequest("/payments/history");
  },

  getMySubscription: async () => {
    return apiRequest("/payments/subscription/me");
  },

  cancelSubscription: async () => {
    return apiRequest("/payments/subscription/cancel", { method: "POST" });
  },

  simulateSuccess: async (transactionId, paymentType, boostLevel = 1, planType = "pro") => {
    return apiRequest(
      `/payments/test/simulate-success?transaction_id=${transactionId}&payment_type=${paymentType}&boost_level=${boostLevel}&plan_type=${planType}`,
      { method: "POST" }
    );
  },
};
