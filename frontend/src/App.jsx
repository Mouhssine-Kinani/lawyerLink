import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from "./store/auth.store";
// Layouts
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// ── Auth pages ────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// ── Client pages ──────────────────────────────────────────
import LawyerListPage from './pages/client/LawyerListPage'
import LawyerProfilePage from './pages/client/LawyerProfilePage'
import ReservationPage from './pages/client/ReservationPage'
import RecommendationsPage from './pages/client/RecommendationsPage'
import MyReservationsPage from './pages/client/MyReservationsPage'
import ReviewPage from './pages/client/ReviewPage'
import ChatPage from './pages/client/ChatPage'

// ── Lawyer pages ──────────────────────────────────────────
import DashboardPage from './pages/lawyer/DashboardPage'
import ProfileEditPage from './pages/lawyer/ProfileEditPage'
import SubscriptionPage from './pages/lawyer/SubscriptionPage'
import BoostPage from './pages/lawyer/BoostPage'
import LawyerReservationsPage from './pages/lawyer/MyReservationsPage'

// ── Admin pages ───────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard'
import LawyerApprovalPage from './pages/admin/LawyerApprovalPage'
import UsersPage from './pages/admin/UsersPage'

// ── Route guards ──────────────────────────────────────────
import PrivateRoute from './components/common/PrivateRoute'
import RoleRoute from './components/common/RoleRoute'


// TODO: Replace with your real auth store / hook
// const mockUser = { name: 'Alex Thompson', role: 'Premium Client' }


export default function App() {
  const user = useAuthStore((state) => state.user);
  return (
    <BrowserRouter>
      <Routes>

        {/* ─────────────────────────────────────────────────────────
            PUBLIC routes — Navbar + Footer visible, no sidebar
        ───────────────────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          {/* Landing — currently redirects to lawyer list; swap with <HomePage /> once built */}
          <Route index element={<Navigate to="/lawyers" replace />} />

          {/* Auth */}
          <Route path="login"    element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Browsing lawyers (public — no login needed) */}
          <Route path="lawyers"              element={<LawyerListPage />} />
          <Route path="lawyers/:id"          element={<LawyerProfilePage />} />

          {/* Booking flow — requires login */}
          <Route element={<PrivateRoute />}>
            <Route path="lawyers/:id/book"   element={<ReservationPage />} />
            <Route path="lawyers/:id/review" element={<ReviewPage />} />
          </Route>
        </Route>

        {/* ─────────────────────────────────────────────────────────
            CLIENT dashboard routes — Sidebar visible, no top Navbar
        ───────────────────────────────────────────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute allowedRole="client" />}>
            <Route
              element={<DashboardLayout user={user} />}
              path="client"
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"      element={<div className="text-gray-700">Client Dashboard — drop your component here</div>} />
              <Route path="chat"           element={<ChatPage />} />
              <Route path="reservations"   element={<MyReservationsPage />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              {/* profile & settings — add your pages here */}
            </Route>
          </Route>
        </Route>

        {/* ─────────────────────────────────────────────────────────
            LAWYER dashboard routes
        ───────────────────────────────────────────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute allowedRole="lawyer" />}>
            <Route
              element={<DashboardLayout user={{ name: 'Lawyer Name', role: 'Attorney' }} />}
              path="lawyer"
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"    element={<DashboardPage />} />
              <Route path="profile/edit" element={<ProfileEditPage />} />
              <Route path="reservations" element={<LawyerReservationsPage />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="boost"        element={<BoostPage />} />
            </Route>
          </Route>
        </Route>

        {/* ─────────────────────────────────────────────────────────
            ADMIN dashboard routes
        ───────────────────────────────────────────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute allowedRole="admin" />}>
            <Route
              element={<DashboardLayout user={{ name: 'Admin', role: 'Administrator' }} />}
              path="admin"
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="lawyers"   element={<LawyerApprovalPage />} />
              <Route path="users"     element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}