/**
 * RouteContext
 *
 * Handles two use cases:
 *
 * 1. BUILDING — user adds/removes/reorders stops on /build-route,
 *    then picks a mode and saves to Firestore.
 *
 * 2. VIEWING — SavedRoutesPage loads a ResolvedRoute into context
 *    and RouteLine renders the polyline.
 *
 * The same stops[] array serves both cases.
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
import type { Monuments } from "../types/Monuments";

// ─── Haversine ────────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;
function toRad(deg: number) { return (deg * Math.PI) / 180; }
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
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

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransportMode = "foot-walking" | "driving-car" | "cycling";

// eslint-disable-next-line react-refresh/only-export-components
export const TRANSPORT_OPTIONS: { mode: TransportMode; label: string; icon: string }[] = [
  { mode: "foot-walking", label: "Walking",  icon: "🚶" },
  { mode: "driving-car",  label: "Driving",  icon: "🚗" },
  { mode: "cycling",      label: "Cycling",  icon: "🚲" },
];

interface RouteContextValue {
  // shared
  stops: RouteStop[];
  routeName: string | null;
  totalDistanceKm: number;
  // viewing
  setRoute: (route: ResolvedRoute) => void;
  clearRoute: () => void;
  // building
  transportMode: TransportMode;
  setTransportMode: (mode: TransportMode) => void;
  addStop: (monument: Monuments) => void;
  removeStop: (monumentId: string) => void;
  moveStop: (fromIndex: number, toIndex: number) => void;
  isInRoute: (monumentId: string) => boolean;
}

const RouteContext = createContext<RouteContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const RouteProvider = ({ children }: { children: ReactNode }) => {
  const [stops, setStops]               = useState<RouteStop[]>([]);
  const [routeName, setRouteName]       = useState<string | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>("foot-walking");

  // ── Viewing ──
  const setRoute = useCallback((route: ResolvedRoute) => {
    setStops(route.stops);
    setRouteName(route.name);
  }, []);

  const clearRoute = useCallback(() => {
    setStops([]);
    setRouteName(null);
  }, []);

  // ── Building ──
  const addStop = useCallback((monument: Monuments) => {
    setStops((prev) => {
      if (prev.some((s) => s.monument.id === monument.id)) return prev;
      return [...prev, { monument, order: prev.length + 1 }];
    });
  }, []);

  const removeStop = useCallback((monumentId: string) => {
    setStops((prev) => {
      const filtered = prev.filter((s) => s.monument.id !== monumentId);
      return filtered.map((s, i) => ({ ...s, order: i + 1 }));
    });
  }, []);

  const moveStop = useCallback((fromIndex: number, toIndex: number) => {
    setStops((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated.map((s, i) => ({ ...s, order: i + 1 }));
    });
  }, []);

  const isInRoute = useCallback(
    (monumentId: string) => stops.some((s) => s.monument.id === monumentId),
    [stops]
  );

  const totalDistanceKm = useMemo(() => computeTotalDistance(stops), [stops]);

  return (
    <RouteContext.Provider value={{
      stops, routeName, totalDistanceKm,
      setRoute, clearRoute,
      transportMode, setTransportMode,
      addStop, removeStop, moveStop, isInRoute,
    }}>
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