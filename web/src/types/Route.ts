/**
 * Route Type Definitions
 *
 * Defines the TypeScript structures for saved routes stored in Firestore
 * and for the in-memory route state used by RouteContext.
 *
 * Firestore structure (top-level "routes" collection, created by admin):
 *
 * routes
 *   └ routeId
 *        userId:      string        (matches Firebase Auth UID)
 *        name:        string        (display name for the route)
 *        monumentIds: string[]      (ordered list of monument document IDs)
 *        createdAt:   Timestamp
 *
 * RouteStop is the in-memory representation — the full Monuments object
 * is joined client-side after fetching monumentIds from Firestore.
 */

import type { Monuments } from "./Monuments";
import type { TransportMode } from "../context/RouteContext";

/** A single stop in the in-memory route (after joining monument data) */
export interface RouteStop {
  monument: Monuments;
  order: number; // 1-based
}

/** The raw Firestore document shape for a saved route */
export interface SavedRouteDoc {
  user_uid: string;
  title: string;
  mode: string;
  distanceKm: number;
  durationMin: number;
  shareToken: string;
  landmarks: unknown[];
  creation_time: unknown;
}

/** The fully resolved route (used in UI after joining monument data) */
export interface ResolvedRoute {
  id: string;
  name: string;
  stops: RouteStop[];
  shareToken: string | null;
  mode: TransportMode;
  distanceKm: number;
  durationMin: number;
}