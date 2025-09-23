import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;

  return user ? <Navigate to="/trips" replace /> : <Outlet />;
}
