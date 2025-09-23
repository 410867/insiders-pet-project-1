import { useParams } from "react-router-dom";
export default function TripAccess() {
  const { id } = useParams();
  return <h1>Trip access (Owner only) for #{id}</h1>;
}
