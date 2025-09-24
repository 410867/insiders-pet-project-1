import { useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { createInvite } from "../../services/invites";

type Props = { tripId?: string };

export default function TripAccess(props: Props) {
  const params = useParams();
  const tripId = props.tripId ?? params.id;

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [lastLink, setLastLink] = useState<string | null>(null);

  async function checkOwner() {
    if (!tripId) throw new Error("Немає tripId");
    const u = auth.currentUser;
    if (!u) throw new Error("Login required");
    const trip = await getDoc(doc(db, "trips", tripId));
    if (!trip.exists()) throw new Error("Trip not found");
    if (trip.data().ownerUid !== u.uid) throw new Error("Тільки власник може запрошувати");
  }

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!tripId) throw new Error("Немає tripId");
      setSending(true);
      await checkOwner();
      const { link } = await createInvite(tripId, email.trim());
      setLastLink(link);
      setEmail("");
    } catch (e: any) {
      alert(e?.message || "Не вдалося надіслати інвайт");
    } finally {
      setSending(false);
    }
  };

  if (!tripId) return <p>Некоректний шлях: відсутній id подорожі</p>;

  return (
    <div>
      <h2>Доступ до подорожі</h2>
      <form onSubmit={onSend}>
        <input
          type="email"
          placeholder="Email Collaborator'а"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button disabled={sending}>Надіслати інвайт</button>
      </form>
      {lastLink && (
        <p>Лінк для прийняття (для тесту): <a href={lastLink}>{lastLink}</a></p>
      )}
    </div>
  );
}
