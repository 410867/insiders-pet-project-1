import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "../firebase/config";

export async function register(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(user, { displayName: name });
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
