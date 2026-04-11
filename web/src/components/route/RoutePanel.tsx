/**
 * RoutePanel Component
 *
 * Left-panel UI for viewing saved routes.
 *
 * Responsibilities:
 * - Load saved routes for the authenticated user from Firestore
 * - Let the user select a route to display on the map
 * - Show each stop's: name, address, architect, period, style
 * - Provide a "Read Article" button navigating to /monument/:id
 * - Show total straight-line distance of the active route
 *
 * State:
 * - savedRoutes: ResolvedRoute[]   fetched from routeService
 * - loading / error               fetch lifecycle
 * - activeRouteId                 which route is currently selected
 *
 * On route select → calls RouteContext.setRoute() → RouteLine updates map
 *
 * Placement:
 *   Render inside SplitMapLayout's left panel, below the header.
 *   Requires <RouteProvider> and <AuthProvider> as ancestors.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRoute } from "../../context/RouteContext";
import { useAuth } from "../../context/useAuth";
import { getSavedRoutesForUser } from "../../services/Routeservice";
import type { ResolvedRoute, RouteStop } from "../../types/Route";

// ─── Tokens ───────────────────────────────────────────────────────────────────

const BORDEAUX       = "#6B2737";
const BORDEAUX_LIGHT = "#f3e8ea";
const RED            = "#C0392B";
const MUTED          = "#8a7a7d";
const BORDER         = "#e8dfe0";

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetaRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "6px", fontSize: "12px", lineHeight: 1.5 }}>
      <span style={{ color: MUTED, minWidth: "64px", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#2d1f22", fontWeight: 500 }}>{value}</span>
    </div>
  );
};

const StopCard = ({ stop }: { stop: RouteStop }) => {
  const { monument, order } = stop;

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "14px",
        background: "#fff",
        borderRadius: "10px",
        border: `1px solid ${BORDER}`,
        marginBottom: "10px",
      }}
    >
      {/* Order badge */}
      <div
        style={{
          flexShrink: 0,
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: RED,
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2px",
        }}
      >
        {order}
      </div>

      {/* Monument details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: "0 0 6px",
            fontSize: "14px",
            fontWeight: 700,
            color: BORDEAUX,
            lineHeight: 1.3,
          }}
        >
          {monument.name}
        </p>

        <MetaRow label="Address"   value={monument.location} />
        <MetaRow label="Architect" value={monument.architect} />
        <MetaRow label="Period"    value={monument.period} />
        <MetaRow label="Style"     value={monument.style} />

        {/* Internal link to monument article page */}
        <Link
          to={`/monument/${monument.id}`}
          style={{
            display: "inline-block",
            marginTop: "10px",
            padding: "5px 12px",
            borderRadius: "6px",
            background: BORDEAUX,
            color: "#fff",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textDecoration: "none",
          }}
        >
          Read Article →
        </Link>
      </div>
    </div>
  );
};

// ─── Route selector ───────────────────────────────────────────────────────────

const RouteSelector = ({
  routes,
  activeId,
  onSelect,
}: {
  routes: ResolvedRoute[];
  activeId: string | null;
  onSelect: (route: ResolvedRoute) => void;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
    {routes.map((r) => (
      <button
        key={r.id}
        onClick={() => onSelect(r)}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: `1.5px solid ${activeId === r.id ? BORDEAUX : BORDER}`,
          background: activeId === r.id ? BORDEAUX_LIGHT : "#fff",
          color: activeId === r.id ? BORDEAUX : "#2d1f22",
          fontWeight: activeId === r.id ? 700 : 500,
          fontSize: "13px",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.15s",
        }}
      >
        {r.name}
        <span style={{ float: "right", fontSize: "11px", color: MUTED, fontWeight: 400 }}>
          {r.stops.length} stops
        </span>
      </button>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const RoutePanel = () => {
  const { user } = useAuth();
  const { stops, routeName, totalDistanceKm, setRoute, clearRoute } = useRoute();

  const [savedRoutes, setSavedRoutes]     = useState<ResolvedRoute[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    getSavedRoutesForUser(user.uid)
      .then((routes) => { if (!cancelled) setSavedRoutes(routes); })
      .catch(() => { if (!cancelled) setError("Could not load your saved routes."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [user]);

  const handleSelectRoute = (route: ResolvedRoute) => {
    setActiveRouteId(route.id);
    setRoute(route);
  };

  const handleClear = () => {
    setActiveRouteId(null);
    clearRoute();
  };

  if (!user) {
    return (
      <div style={{ padding: "24px 16px", textAlign: "center", color: MUTED }}>
        <p style={{ fontSize: "13px" }}>Sign in to view your saved routes.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "24px 16px", textAlign: "center", color: MUTED }}>
        <p style={{ fontSize: "13px" }}>Loading routes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px", color: RED, fontSize: "13px" }}>{error}</div>
    );
  }

  if (savedRoutes.length === 0) {
    return (
      <div style={{ padding: "24px 16px", textAlign: "center", color: MUTED }}>
        <p style={{ fontSize: "13px" }}>You have no saved routes yet.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>

      <p style={{ fontSize: "11px", fontWeight: 700, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>
        Your Routes
      </p>

      <RouteSelector
        routes={savedRoutes}
        activeId={activeRouteId}
        onSelect={handleSelectRoute}
      />

      {stops.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: BORDEAUX }}>
                {routeName}
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: MUTED }}>
                {stops.length} stops · ~{totalDistanceKm} km straight-line
              </p>
            </div>
            <button
              onClick={handleClear}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: `1px solid ${BORDER}`,
                background: "#fff",
                color: MUTED,
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          <div>
            {stops.map((stop) => (
              <StopCard key={stop.monument.id} stop={stop} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RoutePanel;