import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRole(snap.data().role || "User");
        } else {
          setRole("User");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    }
    fetchRole();
  }, [user]);

  return { role, loading };
}
