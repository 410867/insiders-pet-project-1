import { useParams } from "react-router-dom";
export default function TripDetails() {
  const { id } = useParams();
  return <h1>Trip details #{id}</h1>;
}
