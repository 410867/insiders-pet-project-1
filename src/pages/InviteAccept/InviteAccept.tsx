import { useParams, useSearchParams } from "react-router-dom";
export default function InviteAccept() {
  const { token } = useParams();
  const [sp] = useSearchParams();
  const trip = sp.get("trip");
  const email = sp.get("email");
  return (
    <div>
      <h1>Accept invite</h1>
      <p>token: {token}</p>
      <p>trip: {trip}</p>
      <p>email: {email}</p>
    </div>
  );
}
