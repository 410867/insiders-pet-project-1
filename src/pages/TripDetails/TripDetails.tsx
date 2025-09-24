import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Trip } from "../../services/trips";
import { getTrip, updateTrip, deleteTrip } from "../../services/trips";

export default function TripDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Partial<Trip>>({});
  const [err, setErr] = useState("");

  const isOwner = user && trip && user.uid === trip.ownerUid;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const t = await getTrip(id);
      setTrip(t);
      setEdit({
        title: t?.title,
        description: t?.description,
        startDate: t?.startDate,
        endDate: t?.endDate,
      });
      setLoading(false);
    })();
  }, [id]);

  const canSave =
    !!edit.title &&
    (!edit.startDate || !edit.endDate || edit.startDate <= edit.endDate);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isOwner || !canSave) return;
    setErr("");
    await updateTrip(id, {
      title: edit.title!,
      description: edit.description || null || undefined,
      startDate: edit.startDate || undefined,
      endDate: edit.endDate || undefined,
    });
    nav(0);
  };

  const onDelete = async () => {
    if (!id || !isOwner) return;
    if (!confirm("Видалити цю подорож?")) return;
    await deleteTrip(id);
    nav("/trips");
  };

  if (loading) return <p>Loading…</p>;
  if (!trip) return <p>Not found</p>;

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 640 }}>
      <h1>{trip.title}</h1>
      <p style={{ color: "#6b7280" }}>
        Owner: <code>{trip.ownerUid}</code>{" "}
        {isOwner ? <strong style={{ color: "#16a34a" }}>(you)</strong> : null}
      </p>

      <div>
        <div><strong>Dates:</strong>{" "}
          {trip.startDate || "—"} → {trip.endDate || "—"}
        </div>
        {trip.description && <p style={{ marginTop: 6 }}>{trip.description}</p>}
      </div>

      {isOwner ? (
        <form onSubmit={onSave} style={{ display: "grid", gap: 8 }}>
          <h3>Edit</h3>
          <input
            value={edit.title || ""}
            onChange={e => setEdit(s => ({ ...s, title: e.target.value }))}
            placeholder="Title *"
            required
          />
          <textarea
            value={edit.description || ""}
            onChange={e => setEdit(s => ({ ...s, description: e.target.value }))}
            placeholder="Description"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span>Start date</span>
              <input
                type="date"
                value={edit.startDate || ""}
                onChange={e => setEdit(s => ({ ...s, startDate: e.target.value }))}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>End date</span>
              <input
                type="date"
                value={edit.endDate || ""}
                onChange={e => setEdit(s => ({ ...s, endDate: e.target.value }))}
              />
            </label>
          </div>
          {edit.startDate && edit.endDate && edit.startDate > edit.endDate && (
            <small style={{ color: "crimson" }}>
              Початок не може бути пізніше завершення.
            </small>
          )}
          {err && <small style={{ color: "crimson" }}>{err}</small>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={!canSave}>Save</button>
            <button type="button" onClick={onDelete} style={{ color: "crimson" }}>
              Delete
            </button>
          </div>
        </form>
      ) : (
        <p style={{ color:"#6b7280" }}>
          Ви Collaborator або гість — редагування недоступне.
        </p>
      )}
    </div>
  );
}
