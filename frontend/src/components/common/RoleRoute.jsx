// frontend/src/components/common/RoleRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

export default function RoleRoute({ allowedRole }) {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  return userRole === allowedRole ? <Outlet /> : <Navigate to="/" replace />;
}
