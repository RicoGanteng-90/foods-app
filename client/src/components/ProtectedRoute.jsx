import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { accessToken, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return accessToken ? children : <Navigate to="/login" replace />;
}
export default ProtectedRoute;
