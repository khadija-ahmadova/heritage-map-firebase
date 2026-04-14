/**
 * Route Service (Firestore Data Layer)
 *
 * getSavedRoutesForUser() — reads saved routes for the current user
 * getRouteByShareToken()  — reads a route by shareToken (any logged-in user)
 * saveRoute()             — writes a new route with a shareToken
 */

import {
  collection, addDoc, getDocs, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { ResolvedRoute, RouteStop } from "../types/Route";
import type { Monuments } from "../types/Monuments";
import type { GeoPoint } from "firebase/firestore";
import type { TransportMode } from "../context/RouteContext";

// ─── Mobile schema types ──────────────────────────────────────────────────────

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

interface MobileRouteDoc {
  user_uid: string;
  title: string;
  mode: string;
  distanceKm: number;
  durationMin: number;
  landmarks: MobileLandmark[];
  shareToken: string;
  creation_time: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function landmarkToMonument(lm: MobileLandmark): Monuments {
  return {
    id: lm.landmark_id,
    name: lm.name,
    architect: lm.architect,
    location: lm.location,
    period: lm.period,
    description: lm.description,
    coordinates: {
      latitude: lm.latitude,
      longitude: lm.longitude,
    } as GeoPoint,
  };
}

function estimateDurationMin(distanceKm: number, mode: TransportMode): number {
  const minPerKm: Record<TransportMode, number> = {
    "foot-walking": 12,
    "driving-car":  3,
    "cycling":      5,
  };
  return Math.round(distanceKm * minPerKm[mode]);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeDistance(stops: RouteStop[]): number {
  if (stops.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i].monument.coordinates;
    const b = stops[i + 1].monument.coordinates;
    total += haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
  }
  return Math.round(total * 100) / 100;
}

/** Generates a random share token */
function generateShareToken(): string {
  return crypto.randomUUID();
}

function docToResolvedRoute(id: string, data: MobileRouteDoc): ResolvedRoute {
  const sorted = [...(data.landmarks ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );
  const stops: RouteStop[] = sorted.map((lm, i) => ({
    monument: landmarkToMonument(lm),
    order: i + 1,
  }));
  return {
    id,
    name: data.title,
    stops,
    shareToken: data.shareToken ?? null,
    mode: data.mode as TransportMode,
    distanceKm: data.distanceKm,
    durationMin: data.durationMin,
  };
}

// ─── READ — own routes ────────────────────────────────────────────────────────

export async function getSavedRoutesForUser(userId: string): Promise<ResolvedRoute[]> {
  const q = query(collection(db, "routes"), where("user_uid", "==", userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];
  return snapshot.docs.map((d) => docToResolvedRoute(d.id, d.data() as MobileRouteDoc));
}

// ─── READ — shared route by token ────────────────────────────────────────────

export async function getRouteByShareToken(token: string): Promise<ResolvedRoute | null> {
  const q = query(collection(db, "routes"), where("shareToken", "==", token));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return docToResolvedRoute(d.id, d.data() as MobileRouteDoc);
}

// ─── WRITE ────────────────────────────────────────────────────────────────────

export async function saveRoute(
  userId: string,
  stops: RouteStop[],
  mode: TransportMode
): Promise<{ id: string; shareToken: string }> {
  const distanceKm  = computeDistance(stops);
  const durationMin = estimateDurationMin(distanceKm, mode);
  const shareToken  = generateShareToken();
  const title       = stops.map((s) => s.monument.name).join(" → ");

  const landmarks: MobileLandmark[] = stops.map((s, i) => ({
    landmark_id: s.monument.id,
    name:        s.monument.name,
    architect:   s.monument.architect ?? "",
    description: s.monument.description ?? "",
    location:    s.monument.location ?? "",
    period:      s.monument.period ?? "",
    latitude:    s.monument.coordinates.latitude,
    longitude:   s.monument.coordinates.longitude,
    order_index: i,
  }));

  const doc: MobileRouteDoc = {
    user_uid: userId,
    title,
    mode,
    distanceKm,
    durationMin,
    landmarks,
    shareToken,
    creation_time: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "routes"), doc);
  return { id: ref.id, shareToken };
}