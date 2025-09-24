import {
  doc, getDoc, setDoc, updateDoc,
  serverTimestamp, arrayUnion
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

export type InviteDoc = {
  tripId: string;
  emailLower: string;
  inviterUid: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  createdAt: any;
  acceptedByUid?: string;
  acceptedAt?: any;
};

const inviteId = (tripId: string, emailLower: string) =>
  `${tripId}_${emailLower}`;

export async function createInvite(tripId: string, email: string) {
  const u = auth.currentUser!;
  const emailLower = email.trim().toLowerCase();
  const id = `${tripId}_${emailLower}`;
  const ref = doc(db, "tripInvites", id);

  try {
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.status === "pending") {
      const link = `${window.location.origin}/invite/accept?trip=${encodeURIComponent(tripId)}&email=${encodeURIComponent(emailLower)}`;
      return { inviteId: id, link, reused: true };
    }
  } catch {}

  await setDoc(ref, {
    tripId,
    emailLower,
    inviterUid: u.uid,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  const link = `${window.location.origin}/invite/accept?trip=${encodeURIComponent(tripId)}&email=${encodeURIComponent(emailLower)}`;
  return { inviteId: id, link, reused: false };
}

export async function acceptInvite(tripId: string, email?: string) {
  const u = auth.currentUser;
  if (!u) throw new Error("Login required");

  const tripRef = doc(db, "trips", tripId);
  try {
    await updateDoc(tripRef, { collaborators: arrayUnion(u.uid) });
    return true;
  } catch (e: any) {
    throw new Error(e?.code === "permission-denied"
      ? "Інвайт не знайдено або прострочено."
      : (e?.message || "Не вдалося прийняти інвайт"));
  }
}

