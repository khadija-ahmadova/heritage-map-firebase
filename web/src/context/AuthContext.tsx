// AuthContext.tsx — Global authentication state for the web app
//
// Flow when the app loads:
//   1. loading = true (we don't know yet if someone is logged in)
//   2. Firebase restores the previous session from localStorage
//   3. onAuthChanged fires → we fetch the role from Firestore
//   4. loading = false → the rest of the app renders with real user data

import {createContext} from 'react'
import type { User } from 'firebase/auth'
import {type UserRole } from '../lib/auth'



export interface AuthContextValue {
  user: User | null        // Firebase User object; null = not logged in
  role: UserRole | null    // role from Firestore; null = not loaded yet
  loading: boolean         // true while Firebase is restoring the session
}


export const AuthContext = createContext<AuthContextValue | null>(null)