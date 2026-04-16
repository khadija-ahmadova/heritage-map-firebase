/**
 * Monuments Type Definition
 *
 * Defines the TypeScript structure for monument documents stored in
 * Cloud Firestore.
 *
 * This interface mirrors the schema used in the "monuments" collection
 * in the Firebase database.
 *
 * Firestore document structure:
 *
 * monuments
 *   └ documentId
 *        name: string
 *        area: string
 *        architect: string
 *        location: string
 *        period: string
 *        coordinates: GeoPoint
 *
 * Notes:
 * - coordinates is stored as a Firestore GeoPoint object.
 * - GeoPoint contains latitude and longitude properties.
 *
 * Used by:
 * - monumentsService.ts
 * - MonumentsMarker.tsx
 * - MonumentsPopup.tsx
 * - MapView.tsx
 *
 * Stack:
 * - React (UI rendering)
 * - Firebase Firestore (data storage)
 */



import type { GeoPoint } from "firebase/firestore"

export interface Monuments {
    id: string
    name: string
    style?: string
    architect: string
    location: string
    period: string
    coordinates: GeoPoint
    description?: string
    imageUrl?: string[]
    published?: boolean
    author_uid?: string
    submission_status?: "pending" | "approved" | "rejected"
}