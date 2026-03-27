/**
 * Monument Data Service
 *
 * Responsible for retrieving monument documents from Cloud Firestore.
 *
 * This service acts as a data access layer between the UI components
 * and the Firebase database.
 *
 * Responsibilities:
 * - Query the "monuments" collection
 * - Convert Firestore documents into typed Monument objects
 * - Return monument data to map components
 *
 * Data Flow:
 *
 * Firestore
 *   ↓
 * monumentService
 *   ↓
 * MapView component
 *   ↓
 * MonumentMarker components
 *
 * Advantages of using a service layer:
 * - Keeps Firebase logic separate from UI
 * - Simplifies testing
 * - Allows future caching or filtering logic
 *
 * Dependencies:
 * - Firebase Firestore
 * - Monument type definition
 */


import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Monuments } from "../types/Monuments";

export async function getMonuments(): Promise<Monuments[]> {
    const snapshot = await getDocs(collection(db, "monuments"))
    return snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Monuments, "id">),
    }))
}

export async function getMonumentById(id: string): Promise<Monuments | null> {
    const snap = await getDoc(doc(db, "monuments", id))
    if (!snap.exists()) return null
    return { id: snap.id, ...(snap.data() as Omit<Monuments, "id">) }
}