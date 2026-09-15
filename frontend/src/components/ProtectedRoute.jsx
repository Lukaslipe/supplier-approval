import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protege rotas: exige login e, opcionalmente, um papel específico.
function ProtectedRoute({ children, somenteAdmin = false }) {

  const { isAutenticado, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (somenteAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
