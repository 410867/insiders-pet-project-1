import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Trip } from "../../services/trips";
import { getTrip, updateTrip, deleteTrip } from "../../services/trips";
import { listPlaces, createPlace, updatePlace, deletePlace, type Place } from "../../services/places";
import { useMemo } from "react";

export default function TripDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Partial<Trip>>({});
  const [err, setErr] = useState("");
  const isOwner = !!(user && trip && user.uid === trip.ownerUid);
  const [places, setPlaces] = useState<Place[]>([]);
  const [pForm, setPForm] = useState<{ locationName: string; notes?: string; dayNumber: number | "" }>({ locationName: "", notes: "", dayNumber: "" });
  const canManage = !!isOwner || (user && trip && trip.collaborators?.includes(user.uid));

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

  useEffect(() => {
    (async () => {
      if (!id) return;
      const list = await listPlaces(id);
      setPlaces(list);
    })();
  }, [id]);

  const canAddPlace = useMemo(() => {
    return !!pForm.locationName.trim() && Number(pForm.dayNumber) >= 1;
  }, [pForm]);

  async function onAddPlace(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !canManage || !canAddPlace) return;
    const newId = await createPlace(id, {
      locationName: pForm.locationName.trim(),
      notes: pForm.notes?.trim() || null,
      dayNumber: Number(pForm.dayNumber),
    });
    setPlaces(prev => [...prev, { id: newId, locationName: pForm.locationName.trim(), notes: pForm.notes?.trim() || null, dayNumber: Number(pForm.dayNumber) }].sort((a,b)=>a.dayNumber-b.dayNumber));
    setPForm({ locationName: "", notes: "", dayNumber: "" });
  }

  async function onSavePlace(placeId: string, patch: Partial<Pick<Place,"locationName"|"notes"|"dayNumber">>) {
    if (!id || !canManage) return;
    await updatePlace(id, placeId, patch);
    setPlaces(prev => prev
      .map(p => p.id === placeId ? { ...p, ...patch } : p)
      .sort((a,b)=>a.dayNumber-b.dayNumber)
    );
  }

  async function onDeletePlace(placeId: string) {
    if (!id || !canManage) return;
    if (!confirm("Видалити місце?")) return;
    await deletePlace(id, placeId);
    setPlaces(prev => prev.filter(p => p.id !== placeId));
  }

  if (loading) return <p>Loading…</p>;
  if (!trip) return <p>Not found</p>;

  return (
    <>
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

      {/* ----- Places ----- */}
        <section style={{ marginTop: 24 }}>
          <h3>Places</h3>

          {canManage && (
            <form onSubmit={onAddPlace} style={{ display: "grid", gap: 8, maxWidth: 520, marginBottom: 12 }}>
              <input
                placeholder="Location name *"
                value={pForm.locationName}
                onChange={e => setPForm(s => ({ ...s, locationName: e.target.value }))}
                required
              />
              <textarea
                placeholder="Notes"
                value={pForm.notes || ""}
                onChange={e => setPForm(s => ({ ...s, notes: e.target.value }))}
              />
              <input
                type="number"
                min={1}
                placeholder="Day number *"
                value={pForm.dayNumber}
                onChange={e => setPForm(s => ({ ...s, dayNumber: e.target.value === "" ? "" : Number(e.target.value) }))}
                required
              />
              <button type="submit" disabled={!canAddPlace}>Add place</button>
            </form>
          )}

          {places.length === 0 ? (
            <p>Поки що немає місць</p>
          ) : (
            <ul style={{ display: "grid", gap: 8, padding: 0, listStyle: "none" }}>
              {places.map(p => (
                <li key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <strong>Day {p.dayNumber}:</strong> {p.locationName}
                      {p.notes ? <div style={{ color:"#6b7280", marginTop: 4 }}>{p.notes}</div> : null}
                    </div>

                    {canManage && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            const locationName = prompt("Location name", p.locationName) ?? "";
                            if (!locationName.trim()) return;
                            const notes = prompt("Notes (optional)", p.notes ?? "") ?? "";
                            const dnStr = prompt("Day number", String(p.dayNumber)) ?? String(p.dayNumber);
                            const dayNumber = Number(dnStr);
                            if (!Number.isInteger(dayNumber) || dayNumber < 1) {
                              alert("dayNumber має бути цілим числом ≥ 1");
                              return;
                            }
                            onSavePlace(p.id, { locationName: locationName.trim(), notes: notes.trim() || null, dayNumber });
                          }}
                        >
                          Edit
                        </button>
                        <button type="button" onClick={() => onDeletePlace(p.id)} style={{ color: "crimson" }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

    </>
  );
}
