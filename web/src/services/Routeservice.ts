/**
 * Route Service (Firestore Data Layer)
 *
 * Reads saved routes belonging to the currently authenticated user.
 *
 * Actual Firestore schema (written by mobile app):
 *
 * routes
 *   └ {documentId}
 *        user_uid:      string       ← Firebase Auth UID
 *        title:         string       ← route display name
 *        mode:          string       ← transport mode from mobile
 *        distanceKm:    double
 *        durationMin:   int64
 *        creation_time: timestamp
 *        landmarks:     array of maps
 *          └ {
 *              landmark_id:  string
 *              name:         string
 *              architect:    string
 *              description:  string
 *              location:     string
 *              period:       string
 *              latitude:     double
 *              longitude:    double
 *              order_index:  int64
 *            }
 *
 * Note: monument data is embedded inside each landmark map — no
 * secondary Firestore lookup needed.
 */

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { ResolvedRoute, RouteStop } from "../types/Route";
import type { Monuments } from "../types/Monuments";
import type { GeoPoint } from "firebase/firestore";

// Shape of each item in the landmarks array as stored by mobile
interface MobileLandmark {
  landmark_id: string;
  name: string;
  architect: string;
  description: string;
  location: string;
  period: string;
  latitude: number;
  longitude: number;
  order_index: number;
}

// Shape of the Firestore route document as stored by mobile
interface MobileRouteDoc {
  user_uid: string;
  title: string;
  mode: string;
  distanceKm: number;
  durationMin: number;
  landmarks: MobileLandmark[];
}

/**
 * Convert a MobileLandmark map into a Monuments object.
 * We reconstruct a GeoPoint-compatible object from the stored
 * latitude/longitude doubles since mobile stores them flat.
 */
function landmarkToMonument(lm: MobileLandmark): Monuments {
  return {
    id: lm.landmark_id,
    name: lm.name,
    architect: lm.architect,
    location: lm.location,
    period: lm.period,
    description: lm.description,
    // Reconstruct a GeoPoint-compatible object from flat lat/lng
    coordinates: {
      latitude: lm.latitude,
      longitude: lm.longitude,
    } as GeoPoint,
  };
}

/**
 * Fetch all saved routes for a user.
 * Monument data is embedded in each document — no secondary lookups needed.
 *
 * @param userId  Firebase Auth UID of the current user
 * @returns       Array of fully resolved routes
 */
export async function getSavedRoutesForUser(
  userId: string
): Promise<ResolvedRoute[]> {
  const routesRef = collection(db, "routes");
  const q = query(routesRef, where("user_uid", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return [];

  return snapshot.docs.map((routeDoc) => {
    const data = routeDoc.data() as MobileRouteDoc;

    // Sort landmarks by order_index, then map to RouteStop
    const sorted = [...(data.landmarks ?? [])].sort(
      (a, b) => a.order_index - b.order_index
    );

    const stops: RouteStop[] = sorted.map((lm, i) => ({
      monument: landmarkToMonument(lm),
      order: i + 1,
    }));

    return {
      id: routeDoc.id,
      name: data.title,
      stops,
    } satisfies ResolvedRoute;
  });
}