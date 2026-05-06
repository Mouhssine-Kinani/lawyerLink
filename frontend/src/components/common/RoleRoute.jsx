import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import PrivateRoute from "./PrivateRoute";

export default function RoleRoute({ children, requiredRole }) {
  const { user } = useAuth();

  return (
    <PrivateRoute>
      {user?.role !== requiredRole ? (
        <Navigate to="/" replace />
      ) : (
        children
      )}
    </PrivateRoute>
  );
}
