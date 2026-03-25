/**
 * Filter Service (Firestore Data Layer)
 *
 * Responsibilities:
 * - Fetch monuments with optional filtering
 * - Extract unique field values for building filter lists
 *
 * This service abstracts all Firestore queries used by:
 * - MapView (monument markers)
 * - Left panel filters (architects, periods, locations)
 *
 * Data Source:
 * Firestore → "monuments" collection
 *
 * Fields used for filtering:
 * - architect
 * - period
 * - location
 *
 * Functions:
 *
 * 1. getMonumentsByFilter()
 *    → Returns monuments filtered by a specific field/value
 *
 * 2. getUniqueFieldValues()
 *    → Returns unique values for a field (used for filter UI)
 *
 * Notes:
 * - If no filter value is provided → returns ALL monuments
 * - Uses Firestore "where" query for efficient filtering
 * - Unique values are deduplicated using Set()
 */

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Monuments } from "../types/Monuments";

/**
 *  Get monument with optional filtering
 */

export async function getMonumentsByFilter(
    field: "architect" | "period" | "location",
    value: string | null
): Promise<Monuments[]> {
    const colRef = collection(db, "monuments");

    const q = value
        ? query(colRef, where(field, "==", value))
        : colRef;

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Monuments, "id">),
    }));
}

/**
 * Get unique values
 */

export async function getUniqueFieldVaules(field:string): Promise<string[]> {
    const snapshot = await getDocs(collection(db, "monuments"));

    const values = snapshot.docs.map((doc => doc.data()[field]));

    return Array.from(new Set(values)).filter(Boolean);
    
}