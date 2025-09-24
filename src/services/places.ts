import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, getDocs, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";

export type Place = {
  id: string;
  locationName: string;
  notes?: string | null;
  dayNumber: number;
  createdAt?: any;
  updatedAt?: any;
};

const placesCol = (tripId: string) => collection(db, "trips", tripId, "places");

export async function listPlaces(tripId: string): Promise<Place[]> {
  const q = query(placesCol(tripId), orderBy("dayNumber", "asc"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function createPlace(
  tripId: string,
  payload: Omit<Place, "id" | "createdAt" | "updatedAt">
) {
  const data = {
    locationName: payload.locationName,
    notes: payload.notes ?? null,
    dayNumber: payload.dayNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(placesCol(tripId), data);
  return ref.id;
}

export async function updatePlace(
  tripId: string,
  placeId: string,
  patch: Partial<Omit<Place, "id" | "createdAt" | "updatedAt">>
) {
  const ref = doc(db, "trips", tripId, "places", placeId);
  await updateDoc(ref, {
    ...(patch.locationName !== undefined ? { locationName: patch.locationName } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes ?? null } : {}),
    ...(patch.dayNumber !== undefined ? { dayNumber: patch.dayNumber } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePlace(tripId: string, placeId: string) {
  await deleteDoc(doc(db, "trips", tripId, "places", placeId));
}
