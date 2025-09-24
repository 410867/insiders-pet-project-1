import {
  addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs,
  orderBy, query, serverTimestamp, updateDoc, where
} from "firebase/firestore";
import { db } from "../firebase/config";

export type Trip = {
  id?: string;
  ownerUid: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  collaborators: string[];
  createdAt?: any;
  updatedAt?: any;
};

const tripsCol = collection(db, "trips");

export async function createTrip(data: Omit<Trip, "id"|"collaborators"|"createdAt"|"updatedAt">) {
  const ref = await addDoc(tripsCol, {
    ...data,
    collaborators: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getTrip(id: string) {
  const snap = await getDoc(doc(tripsCol, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Trip) : null;
}

export async function listMyTrips(uid: string) {
  const qOwner = query(tripsCol, where("ownerUid","==",uid), orderBy("createdAt","desc"));
  const qColl  = query(tripsCol, where("collaborators","array-contains",uid), orderBy("createdAt","desc"));
  const [o, c] = await Promise.all([getDocs(qOwner), getDocs(qColl)]);
  const map = new Map<string, Trip>();
  o.forEach(d => map.set(d.id, { id:d.id, ...d.data() } as Trip));
  c.forEach(d => map.set(d.id, { id:d.id, ...d.data() } as Trip));
  return [...map.values()];
}

export async function updateTrip(id: string, patch: Partial<Trip>) {
  await updateDoc(doc(tripsCol, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteTrip(id: string) {
  await deleteDoc(doc(tripsCol, id));
}

export async function addCollaborator(tripId: string, uid: string) {
  await updateDoc(doc(tripsCol, tripId), { collaborators: arrayUnion(uid) });
}
