import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/auth";
import { useState } from "react";
import { useUserRole } from "../hooks/useUserRole";

export default function AppLayout() {
  const { user } = useAuth();
  const { role, loading } = useUserRole();
  const nav = useNavigate();
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    await logout();
    setMessage("Ви вийшли з акаунта");
    nav("/login");
  };

  return (
    <div>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {user ? (
          <>
            <Link to="/trips">Trips</Link>
            <span>
              {user.email}{" "}
              {!loading && role ? (
                <strong>({role})</strong>
              ) : (
                <em>loading...</em>
              )}
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <Outlet />
    </div>
  );
}
