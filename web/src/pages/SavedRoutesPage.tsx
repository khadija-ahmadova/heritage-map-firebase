/**
 * SavedRoutesPage
 *
 * Layout:
 *   LEFT  — accordion list of saved routes; clicking a route name
 *            expands its stop cards inline
 *   RIGHT — map showing ONLY the monuments from the selected route
 *            with a red polyline via RouteLine
 *
 * Map behaviour:
 *   When a route is selected, MapView receives the route's monuments
 *   as a prop and renders only those markers (plus RouteLine overlay).
 *   When no route is selected the map shows all monuments.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/useAuth";
import { useRoute } from "../context/RouteContext";
import { getSavedRoutesForUser } from "../services/routeService";
import type { ResolvedRoute, RouteStop } from "../types/Route";
import RouteLine from "../components/map/RouteLine";
import MonumentsPopup from "../components/map/MonumentsPopup";
import { deleteRoute } from "../services/routeService";

const DefaultIcon = L.icon({ iconUrl: markerIcon });
L.Marker.prototype.options.icon = DefaultIcon;

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
          {monument.location && (
            <p className="text-xs text-gray-500">{monument.location}</p>
          )}
          {monument.architect && (
            <p className="text-xs text-gray-500">{monument.architect}</p>
          )}
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

// ─── Accordion route item ─────────────────────────────────────────────────────

const RouteAccordionItem = ({
  route,
  isOpen,
  onToggle,
  onDelete,
  onEdit,
}: {
  route: ResolvedRoute;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) => (
  <div className="mb-2">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 hover:bg-bg-seashell transition-colors text-left"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">{route.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{route.stops.length} stops</p>
      </div>
      <svg
        className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-3 ${isOpen ? "rotate-180" : ""}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    {isOpen && (
      <div className="mt-2 pl-2">
        {route.stops.map((stop) => (
          <StopCard key={stop.monument.id} stop={stop} />
        ))}
      </div>
    )}

    <button
      onClick={onDelete}
      className="text-xs text-red-500 hover:text-red-700 transition-colors"
    >
      Remove
    </button>
    <button
      onClick={onEdit}
      className="text-xs text-blue-500 hover:text-blue-700 transition-colors mr-3"
    >
      Edit
    </button>
  </div>
);

// ─── Route-only map ───────────────────────────────────────────────────────────
// Renders only the monuments from the active route + the red RouteLine.
// When no route is selected it shows a plain map of Baku.

const RouteMap = ({ stops }: { stops: RouteStop[] }) => (
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

    {/* Only render markers for monuments in the active route */}
    {stops.map((stop) => {
      const coords = stop.monument.coordinates;
      if (!coords) return null;
      return (
        <Marker
          key={stop.monument.id}
          position={[coords.latitude, coords.longitude]}
        >
          <Popup>
            <MonumentsPopup monuments={stop.monument} />
          </Popup>
        </Marker>
      );
    })}

    {/* Red polyline + numbered circles */}
    {stops.length >= 2 && <RouteLine />}
  </MapContainer>
);

// ─── Inner page ───────────────────────────────────────────────────────────────

function SavedRoutesInner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stops, setRoute, clearRoute } = useRoute();

  const handleEdit = (route: ResolvedRoute) => {
  // Load route into global context
  setRoute(route);

  // Navigate into route-building mode
  navigate(`/search-by-architect?mode=route&edit=${route.id}`);

  
};

  const [savedRoutes, setSavedRoutes] = useState<ResolvedRoute[]>([]);
  const handleDelete = async (routeId: string) => {
  const confirmed = window.confirm("Delete this route?");
  if (!confirmed) return;

  try {
    await deleteRoute(routeId);

    setSavedRoutes((prev) =>
      prev.filter((r) => r.id !== routeId)
    );

    // If deleted route is currently open → clear map
    if (openRouteId === routeId) {
      setOpenRouteId(null);
      clearRoute();
    }

  } catch (err) {
    console.error("Failed to delete route", err);
  }
};
  const [openRouteId, setOpenRouteId] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/signin", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getSavedRoutesForUser(user.uid)
      .then((routes) => { if (!cancelled) setSavedRoutes(routes); })
      .catch(() => { if (!cancelled) setError("Could not load your saved routes."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
  return () => {
    clearRoute(); // cleanup when leaving page
  };
}, [clearRoute]);

  const handleToggle = (route: ResolvedRoute) => {
    if (openRouteId === route.id) {
      // Collapse — clear map too
      setOpenRouteId(null);
      clearRoute();
    } else {
      // Expand and load onto map
      setOpenRouteId(route.id);
      setRoute(route);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="w-1/2 bg-bg-seashell flex flex-col h-full">

        {/* Header */}
        <div className="bg-accent-bordeaux text-white px-6 py-4 flex-shrink-0 flex items-center justify-between">
          <h1 className="text-lg font-bold">Saved Routes</h1>
          <Link
            to="/dashboard"
            className="text-xs text-white/70 hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Accordion list */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <p className="text-sm text-gray-400 text-center mt-8">Loading routes…</p>
          )}
          {error && (
            <p className="text-sm text-red-500 text-center mt-8">{error}</p>
          )}
          {!loading && !error && savedRoutes.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-8">
              You have no saved routes yet.
            </p>
          )}
          {savedRoutes.map((route) => (
            <RouteAccordionItem
              key={route.id}
              route={route}
              isOpen={openRouteId === route.id}
              onToggle={() => handleToggle(route)}
              onDelete={() => handleDelete(route.id)}
              onEdit={() => handleEdit(route)}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — MAP ── */}
      <div className="w-1/2 h-full">
        <RouteMap stops={stops} />
      </div>

    </div>
  );
}

// ─── Exported page ────────────────────────────────────────────────────────────

export default function SavedRoutesPage() {
  return (
      <SavedRoutesInner />
  );
}