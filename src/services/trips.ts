import {
  addDoc, collection, doc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";

export type Trip = {
  id: string;
  ownerUid: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  collaborators: string[];
  createdAt?: any;
  updatedAt?: any;
};

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

export async function listMyTrips(uid: string): Promise<Trip[]> {
  const tripsCol = collection(db, "trips");
  const [s1, s2] = await Promise.all([
    getDocs(query(tripsCol, where("ownerUid", "==", uid))),
    getDocs(query(tripsCol, where("collaborators", "array-contains", uid))),
  ]);

  const map = new Map<string, Trip>();
  s1.forEach(d => map.set(d.id, { id: d.id, ...(d.data() as any) }));
  s2.forEach(d => map.set(d.id, { id: d.id, ...(d.data() as any) }));
  return Array.from(map.values());
}

export async function createTrip(payload: Omit<Trip,"id"|"createdAt"|"updatedAt"|"collaborators">) {
  const data = stripUndefined({
    ...payload,
    collaborators: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const ref = await addDoc(collection(db, "trips"), data);
  return ref.id;
}

export async function getTrip(id: string): Promise<Trip | null> {
  const snap = await getDoc(doc(db, "trips", id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null;
}

export async function updateTrip(
  id: string,
  patch: Partial<Omit<Trip,"id"|"ownerUid"|"collaborators"|"createdAt"|"updatedAt">>
) {
  const data = stripUndefined({
    ...patch,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "trips", id), data);
}

export async function deleteTrip(id: string) {
  await deleteDoc(doc(db, "trips", id));
}
