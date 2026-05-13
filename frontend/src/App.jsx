import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ─── Context & Guards ────────────────────────────────────────────────────────
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute"; // Requires logged-in user
import RoleRoute from "./components/common/RoleRoute";       // Requires a specific role

// ─── Public Pages ────────────────────────────────────────────────────────────
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// ─── Client Pages ────────────────────────────────────────────────────────────
import LawyerListPage from "./pages/client/LawyerListPage";
import LawyerProfilePage from "./pages/client/LawyerProfilePage";
import ChatPage from "./pages/client/ChatPage";
import ReservationPage from "./pages/client/ReservationPage";
import MyReservationsPage from "./pages/client/MyReservationsPage";
import RecommendationsPage from "./pages/client/RecommendationsPage";
import ReviewPage from "./pages/client/ReviewPage";
import ClientProfile from "./pages/client/ClientProfile";
import MyReviewsPage from "./pages/client/MyReviewsPage";

// ─── Lawyer Pages ────────────────────────────────────────────────────────────
import LawyerDashboardPage from "./pages/lawyer/DashboardPage";
import LawyerMyReservationsPage from "./pages/lawyer/MyReservationsPage";
import LawyerProfileEditPage from "./pages/lawyer/ProfileEditPage";
import LawyerSubscriptionPage from "./pages/lawyer/SubscriptionPage";
import LawyerBoostPage from "./pages/lawyer/BoostPage";

// ─── Admin Pages ─────────────────────────────────────────────────────────────
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import LawyerApprovalPage from "./pages/admin/LawyerApprovalPage";

// =============================================================================
// Route definitions
// Each section is wrapped in the appropriate guard:
//   • No guard      → anyone can visit
//   • <PrivateRoute> → must be logged in (any role)
//   • <RoleRoute>   → must be logged in AND have the specified role
// =============================================================================

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider makes the current user & auth helpers available app-wide */}
      <AuthProvider>
        <Routes>

          {/* ── Public ─────────────────────────────────────────────────────── */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Client (any authenticated user) ────────────────────────────── */}
          <Route path="/client/lawyers"
            element={<PrivateRoute><LawyerListPage /></PrivateRoute>}
          />
          <Route path="/client/lawyers/:id"
            element={<PrivateRoute><LawyerProfilePage /></PrivateRoute>}
          />
          <Route path="/client/chat"
            element={<PrivateRoute><ChatPage /></PrivateRoute>}
          />
          <Route path="/client/reservations"
            element={<PrivateRoute><MyReservationsPage /></PrivateRoute>}
          />
          <Route path="/client/reservations/new"
            element={<PrivateRoute><ReservationPage /></PrivateRoute>}
          />
          <Route path="/client/recommendations"
            element={<PrivateRoute><RecommendationsPage /></PrivateRoute>}
          />
          <Route path="/client/reviews"
            element={<PrivateRoute><ReviewPage /></PrivateRoute>}
          />
          <Route path="/client/profile"
            element={<PrivateRoute><ClientProfile /></PrivateRoute>}
          />
          <Route path="/client/my-reviews"
            element={<PrivateRoute><MyReviewsPage /></PrivateRoute>}
          />

          {/* ── Lawyer (role = "lawyer") ─────────────────────────────────── */}
          <Route path="/lawyer/dashboard"
            element={<RoleRoute requiredRole="lawyer"><LawyerDashboardPage /></RoleRoute>}
          />
          <Route path="/lawyer/reservations"
            element={<RoleRoute requiredRole="lawyer"><LawyerMyReservationsPage /></RoleRoute>}
          />
          <Route path="/lawyer/profile"
            element={<RoleRoute requiredRole="lawyer"><LawyerProfileEditPage /></RoleRoute>}
          />
          <Route path="/lawyer/subscription"
            element={<RoleRoute requiredRole="lawyer"><LawyerSubscriptionPage /></RoleRoute>}
          />
          <Route path="/lawyer/boost"
            element={<RoleRoute requiredRole="lawyer"><LawyerBoostPage /></RoleRoute>}
          />

          {/* ── Admin (role = "admin") ───────────────────────────────────── */}
          <Route path="/admin/dashboard"
            element={<RoleRoute requiredRole="admin"><AdminDashboard /></RoleRoute>}
          />
          <Route path="/admin/users"
            element={<RoleRoute requiredRole="admin"><UsersPage /></RoleRoute>}
          />
          <Route path="/admin/lawyers/approval"
            element={<RoleRoute requiredRole="admin"><LawyerApprovalPage /></RoleRoute>}
          />

          {/* ── Fallback: redirect unknown paths to home ─────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}