/**
 * RouteContext
 *
 * Global in-memory state for the currently displayed route.
 *
 * Responsibilities:
 * - Hold the ordered list of route stops (loaded from a saved route)
 * - Expose setRoute() to load a full ResolvedRoute into state
 * - Expose clearRoute() to reset
 * - Compute straight-line total distance (Haversine) between stops
 *
 * Note:
 * Users cannot build or modify routes — they can only load and view
 * routes that have been saved to their account in Firestore.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { RouteStop, ResolvedRoute } from "../types/Route";

// ─── Haversine ────────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeTotalDistance(stops: RouteStop[]): number {
  if (stops.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i].monument.coordinates;
    const b = stops[i + 1].monument.coordinates;
    total += haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
  }
  return Math.round(total * 100) / 100;
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface RouteContextValue {
  stops: RouteStop[];
  routeName: string | null;
  totalDistanceKm: number;
  setRoute: (route: ResolvedRoute) => void;
  clearRoute: () => void;
}

const RouteContext = createContext<RouteContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const RouteProvider = ({ children }: { children: ReactNode }) => {
  const [stops, setStops]         = useState<RouteStop[]>([]);
  const [routeName, setRouteName] = useState<string | null>(null);

  const setRoute = useCallback((route: ResolvedRoute) => {
    setStops(route.stops);
    setRouteName(route.name);
  }, []);

  const clearRoute = useCallback(() => {
    setStops([]);
    setRouteName(null);
  }, []);

  const totalDistanceKm = useMemo(() => computeTotalDistance(stops), [stops]);

  return (
    <RouteContext.Provider value={{ stops, routeName, totalDistanceKm, setRoute, clearRoute }}>
      {children}
    </RouteContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useRoute(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRoute must be used inside <RouteProvider>");
  return ctx;
}