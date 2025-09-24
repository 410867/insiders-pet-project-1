import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../../firebase/config";
import { acceptInvite } from "../../services/invites";

export default function InviteAccept() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [msg, setMsg] = useState("Опрацьовую інвайт…");

  useEffect(() => {
    const tripId = sp.get("trip");
    const email = sp.get("email") || undefined;
    if (!tripId) { setMsg("Некоректне посилання"); return; }

    const run = async () => {
      if (!auth.currentUser) {
        nav(`/login?redirect=${encodeURIComponent(location.href)}`);
        return;
      }
      try {
        await acceptInvite(tripId, email);
        setMsg("Інвайт прийнято! Перехід…");
        nav(`/trips/${tripId}`);
      } catch (e: any) {
        setMsg(`Помилка: ${e.message || e.code}`);
      }
    };
    run();
  }, []);

  return <p>{msg}</p>;
}
