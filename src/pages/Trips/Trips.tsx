import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Trip } from "../../services/trips";
import { listMyTrips, createTrip } from "../../services/trips";

type NewTrip = {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export default function Trips() {
  const { user } = useAuth();
  const [items, setItems] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<NewTrip>({ title: "" });
  const [err, setErr] = useState<string>("");

  const canSubmit = useMemo(() => {
    if (!form.title.trim()) return false;
    if (form.startDate && form.endDate && form.startDate > form.endDate) return false;
    return true;
  }, [form]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const data = await listMyTrips(user.uid);
      setItems(data);
      setLoading(false);
    })();
  }, [user]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!user) return;
    if (!canSubmit) {
      setErr("Перевір поля (порожній title або startDate > endDate).");
      return;
    }
    const payload: Omit<Trip,"id"|"collaborators"|"createdAt"|"updatedAt"> = {
      ownerUid: user.uid,
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    const id = await createTrip(payload);
    setItems(prev => [{ id, ...payload, collaborators: [] }, ...prev]);
    setForm({ title: "" });
  };

  if (!user) return <p>Необхідна авторизація</p>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section>
        <h2>Create trip</h2>
        <form onSubmit={onCreate} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <input
            placeholder="Title *"
            value={form.title}
            onChange={e => setForm(t => ({ ...t, title: e.target.value }))}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description || ""}
            onChange={e => setForm(t => ({ ...t, description: e.target.value }))}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span>Start date</span>
              <input
                type="date"
                value={form.startDate || ""}
                onChange={e => setForm(t => ({ ...t, startDate: e.target.value }))}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>End date</span>
              <input
                type="date"
                value={form.endDate || ""}
                onChange={e => setForm(t => ({ ...t, endDate: e.target.value }))}
              />
            </label>
          </div>

          {form.startDate && form.endDate && form.startDate > form.endDate && (
            <small style={{ color: "crimson" }}>
              Початок не може бути пізніше завершення.
            </small>
          )}

          {err && <small style={{ color: "crimson" }}>{err}</small>}
          <button type="submit" disabled={!canSubmit}>Create</button>
        </form>
      </section>

      <section>
        <h1>My Trips</h1>
        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <p>Поки що немає подорожей</p>
        ) : (
          <ul style={{ display: "grid", gap: 8, padding: 0, listStyle: "none" }}>
            {items.map(t => (
              <li key={t.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{t.title}</strong>
                    {t.startDate && t.endDate && (
                      <span style={{ marginLeft: 8, color: "#6b7280" }}>
                        ({t.startDate} → {t.endDate})
                      </span>
                    )}
                    {t.ownerUid === user.uid ? (
                      <span style={{ marginLeft: 8, color: "#16a34a" }}>[Owner]</span>
                    ) : (
                      <span style={{ marginLeft: 8, color: "#2563eb" }}>[Collaborator]</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link to={`/trips/${t.id}`}>Details</Link>
                    {t?.id && t.ownerUid === user.uid && (
                      <Link to={`/trips/${t.id}/access`}>Access</Link>
                    )}
                  </div>
                </div>
                {t.description && <p style={{ marginTop: 6, color: "#374151" }}>{t.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
