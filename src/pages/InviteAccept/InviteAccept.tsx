import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";
import { acceptInvite } from "../../services/invites";

export default function InviteAccept() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [msg, setMsg] = useState("Опрацьовую інвайт…");

  useEffect(() => {
    const tripId = sp.get("trip");
    if (!tripId) { setMsg("Некоректне посилання"); return; }

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        nav(`/login?redirect=${encodeURIComponent(location.href)}`);
        return;
      }
      try {
        await acceptInvite(tripId);
        setMsg("Інвайт прийнято! Перехід…");
        nav(`/trips/${tripId}`);
      } catch (e: any) {
        setMsg(`Помилка: ${e?.message || e?.code}`);
      }
    });

    return () => unsub();
  }, []);

  return <p>{msg}</p>;
}
