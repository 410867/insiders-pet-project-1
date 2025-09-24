import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export async function register(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  if (name) await updateProfile(user, { displayName: name });

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: name || "",
    email,
    role: "User",
    createdAt: new Date().toISOString(),
  });

  return user;
}

export async function login(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function logout() {
  await signOut(auth);
}

export function listenAuth(callback: (u: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
