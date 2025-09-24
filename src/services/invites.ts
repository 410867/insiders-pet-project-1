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

export async function acceptInvite(tripId: string) {
  const u = auth.currentUser!;
  const emailLower = (u.email || "").toLowerCase();
  const id = `${tripId}_${emailLower}`;
    const snap = await getDoc(doc(db, "tripInvites", id));
    console.log("invite check", { id, exists: snap.exists(), data: snap.data() });

  try {
    const snap = await getDoc(doc(db, "tripInvites", id));
    console.log("invite check", { id, exists: snap.exists(), data: snap.data() });
  } catch (e) {
    console.warn("invite read failed", e);
  }

  try {
    await updateDoc(doc(db, "trips", tripId), { collaborators: arrayUnion(u.uid) });
    console.log("joined as collaborator", { tripId, uid: u.uid });
  } catch (e: any) {
    console.error("accept failed:", e?.code, e?.message);
    throw e;
  }
}