/**
 * Route Service (Firestore Data Layer)
 *
 * Reads saved routes belonging to the currently authenticated user.
 * Routes are stored in a top-level "routes" collection, each document
 * containing an ordered array of monument IDs and the owner's userId.
 *
 * This service is READ-ONLY from the client. Routes are created/managed
 * by administrators directly in Firestore.
 *
 * Functions:
 *
 * 1. getSavedRoutesForUser()
 *    → Fetches all route docs where userId == current user's UID
 *    → Joins monument data for each monumentId
 *    → Returns fully resolved ResolvedRoute[]
 *
 * Firestore rules required:
 *   match /routes/{routeId} {
 *     allow read: if request.auth != null
 *                 && resource.data.userId == request.auth.uid;
 *     allow write: if false;
 *   }
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Monuments } from "../types/Monuments";
import type { ResolvedRoute, RouteStop, SavedRouteDoc } from "../types/Route";

/**
 * Fetch all saved routes for a user, with monument data joined in.
 *
 * @param userId  Firebase Auth UID of the current user
 * @returns       Array of fully resolved routes (with monument objects)
 */
export async function getSavedRoutesForUser(
  userId: string
): Promise<ResolvedRoute[]> {
  // 1. Query route documents belonging to this user
  const routesRef = collection(db, "routes");
  const q = query(routesRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return [];

  // 2. Resolve each route — join monument data for each monumentId
  const resolved: ResolvedRoute[] = await Promise.all(
    snapshot.docs.map(async (routeDoc) => {
      const data = routeDoc.data() as SavedRouteDoc;

      const stops: RouteStop[] = (
        await Promise.all(
          data.monumentIds.map(async (monumentId, index) => {
            const monumentRef = doc(db, "monuments", monumentId);
            const monumentSnap = await getDoc(monumentRef);

            if (!monumentSnap.exists()) {
              console.warn(`[routeService] Monument not found: ${monumentId}`);
              return null;
            }

            const monument: Monuments = {
              id: monumentSnap.id,
              ...(monumentSnap.data() as Omit<Monuments, "id">),
            };

            return {
              monument,
              order: index + 1,
            } satisfies RouteStop;
          })
        )
      ).filter((stop): stop is RouteStop => stop !== null);

      return {
        id: routeDoc.id,
        name: data.name,
        stops,
      } satisfies ResolvedRoute;
    })
  );

  return resolved;
}