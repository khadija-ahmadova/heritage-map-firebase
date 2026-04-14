/**
 * TourPage
 *
 * Public-facing (but login-required) tour page at /tour/:shareToken
 *
 * Accessed via a share link generated after saving a route.
 * Shows the route name, all stops with full details, and a map
 * with the red polyline.
 *
 * Requires login — redirects to /signin if not authenticated.
 * Any logged-in user can view any route via its shareToken.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/useAuth";
import { RouteProvider, useRoute } from "../context/RouteContext";
import { getRouteByShareToken } from "../services/routeService";
import type { ResolvedRoute, RouteStop } from "../types/Route";
import RouteLine from "../components/map/RouteLine";
import MonumentsPopup from "../components/map/MonumentsPopup";

const DefaultIcon = L.icon({ iconUrl: markerIcon });
L.Marker.prototype.options.icon = DefaultIcon;

const TRANSPORT_LABELS: Record<string, string> = {
  "foot-walking": "🚶 Walking",
  "driving-car":  "🚗 Driving",
  "cycling":      "🚲 Cycling",
};

// ─── Stop card ────────────────────────────────────────────────────────────────

const StopCard = ({ stop }: { stop: RouteStop }) => {
  const { monument, order } = stop;
  return (
    <div className="flex gap-3 bg-white rounded-xl border border-gray-100 p-4 mb-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {order}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-accent-bordeaux leading-snug mb-1">
          {monument.name}
        </p>
        <div className="space-y-0.5 mb-2">
          {monument.location  && <p className="text-xs text-gray-500">{monument.location}</p>}
          {monument.architect && <p className="text-xs text-gray-500">{monument.architect}</p>}
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {monument.period && (
            <span className="text-[10px] bg-bg-seashell text-accent-brown px-2 py-0.5 rounded-full">
              {monument.period}
            </span>
          )}
          {monument.style && (
            <span className="text-[10px] bg-bg-seashell text-accent-brown px-2 py-0.5 rounded-full">
              {monument.style}
            </span>
          )}
        </div>
        <Link
          to={`/monument/${monument.id}`}
          className="text-xs font-medium text-accent-bordeaux hover:underline"
        >
          Read Article →
        </Link>
      </div>
    </div>
  );
};

// ─── Inner (needs RouteContext) ───────────────────────────────────────────────

function TourInner() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { setRoute, stops } = useRoute();

  const [route, setRouteData]   = useState<ResolvedRoute | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Redirect to sign in if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/signin?redirect=/tour/${shareToken}`, { replace: true });
    }
  }, [user, authLoading, navigate, shareToken]);

  // Fetch route by token
  useEffect(() => {
    if (!shareToken || !user) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getRouteByShareToken(shareToken)
      .then((r) => {
        if (cancelled) return;
        if (!r) { setNotFound(true); return; }
        setRouteData(r);
        setRoute(r);
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [shareToken, user, setRoute]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-seashell flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading tour…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-bg-seashell flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500 text-sm">Tour not found or link has expired.</p>
        <Link to="/" className="text-xs text-accent-bordeaux hover:underline">← Go home</Link>
      </div>
    );
  }

  if (!route) return null;

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="w-1/2 bg-bg-seashell flex flex-col h-full">

        {/* Header */}
        <div className="bg-accent-bordeaux text-white px-6 py-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Heritage Tour</p>
              <h1 className="text-base font-bold leading-snug">{route.name}</h1>
              <p className="text-white/70 text-xs mt-1">
                {TRANSPORT_LABELS[route.mode] ?? route.mode}
                {" · "}
                {route.stops.length} stops
                {" · "}
                ~{route.distanceKm} km
                {route.durationMin > 0 && ` · ~${route.durationMin} min`}
              </p>
            </div>
            <Link to="/dashboard" className="text-xs text-white/60 hover:text-white transition-colors flex-shrink-0 ml-4">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Stop list */}
        <div className="flex-1 overflow-y-auto p-5">
          {route.stops.map((stop) => (
            <StopCard key={stop.monument.id} stop={stop} />
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — MAP ── */}
      <div className="w-1/2 h-full">
        <MapContainer
          center={[40.371655182714406, 49.843992955618646]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stops.map((stop) => {
            const coords = stop.monument.coordinates;
            if (!coords) return null;
            return (
              <Marker key={stop.monument.id} position={[coords.latitude, coords.longitude]}>
                <Popup>
                  <MonumentsPopup monuments={stop.monument} />
                </Popup>
              </Marker>
            );
          })}
          <RouteLine />
        </MapContainer>
      </div>

    </div>
  );
}

// ─── Exported page ────────────────────────────────────────────────────────────

export default function TourPage() {
  return (
    <RouteProvider>
      <TourInner />
    </RouteProvider>
  );
}