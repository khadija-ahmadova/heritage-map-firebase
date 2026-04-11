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
 * - style
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
import type { FilterField } from "../types/Filters";

/**
 *  Get monument with optional filtering
 */

export async function getMonumentsByFilter(
    field: FilterField,
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

export async function getUniqueFieldValues(field: FilterField): Promise<string[]> {
    const snapshot = await getDocs(collection(db, "monuments"));

    const values = snapshot.docs.map((doc => doc.data()[field]));

    return Array.from(new Set(values)).filter(Boolean);
    
}

/**
 * Search monuments by multiple fields (prefix search)
 */
 export async function searchMonuments(queryText:string): Promise<Monuments[]> {
    if(!queryText) return [];

    const colRef = collection(db, "monuments");

    const fields: ("name" | "architect" | "period"| "style")[] = [
        "name", 
        "architect", 
        "period",
        "style"
    ];
    
    const results: Monuments[] = [];

    for (const field of fields) {
        const q = query(
            colRef,
            where(field, ">=", queryText),
            where(field, "<=", queryText + "\uf8ff")
        );
        const snapshot = await getDocs(q);

        snapshot.docs.forEach((doc) => {
            results.push({
                id: doc.id,
                ...(doc.data() as Omit<Monuments, "id">),
            });
        });    
    }

    // remove duplicates
    const unique = Array.from(
        new Map(results.map((item) => [item.id, item])).values()
    );

    return unique;
 }