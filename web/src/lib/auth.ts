// Firebase Authentication helper functions

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

export type UserRole = 'visitor' | 'researcher' | 'moderator'


// We store this Firestore for each user
export interface UserProfile {
  user_name: string
  email: string
  role: UserRole
  created_at: ReturnType<typeof serverTimestamp>
}


// Creates a new Firebase Auth account and a matching Firestore doc
// Returns the Firebase User object on success, or throws on error
export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  // Create the Auth account
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const user = credential.user

  // Attach a display name to the Auth account
  await updateProfile(user, { displayName })

  // Create a Firestore document at users/{uid}
  // doc(db, 'users', user.uid) is the path
  await setDoc(doc(db, 'users', user.uid), {
    user_name: displayName,
    email: user.email ?? email,
    role: 'visitor',
    created_at: serverTimestamp(),
  } satisfies UserProfile)

  return user
}


// Logs in an existing user with email + password.
// Firebase validates credentials and returns a User with a session token
export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}


// Clears the Firebase session
// auth.currentUser becomoes null and onAuthStateChanged fires with null
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

// Auth State Listener
export function onAuthChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}


// Reads the role field from the user's Firestore doc
export async function getCurrentUserRole(uid: string): Promise<UserRole | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return (snap.data() as UserProfile).role
}
