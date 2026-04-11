/**
 * RouteLine Component
 *
 * Renders a flat red polyline connecting route stops in order,
 * plus a numbered CircleMarker at each stop position.
 *
 * Reads stops directly from RouteContext — no props required.
 * Must be rendered inside a <MapContainer>.
 *
 * Returns null when fewer than 2 stops are loaded.
 */

import { useEffect } from "react";
import { CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import { useRoute } from "../../context/RouteContext";

const ROUTE_COLOR = "#C0392B"; // red

const RouteLine = () => {
  const { stops } = useRoute();
  const map = useMap();

  // Fit map bounds to show the full route whenever stops change
  useEffect(() => {
    if (stops.length >= 2) {
      const bounds = stops.map((s) => [
        s.monument.coordinates.latitude,
        s.monument.coordinates.longitude,
      ] as [number, number]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [stops, map]);

  if (stops.length < 1) return null;

  const positions = stops.map((s) => [
    s.monument.coordinates.latitude,
    s.monument.coordinates.longitude,
  ] as [number, number]);

  return (
    <>
      {/* Flat red line between stops */}
      {stops.length >= 2 && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: ROUTE_COLOR,
            weight: 3,
            opacity: 0.85,
          }}
        />
      )}

      {/* Numbered circle at each stop */}
      {stops.map((stop, i) => (
        <CircleMarker
          key={stop.monument.id}
          center={positions[i]}
          radius={14}
          pathOptions={{
            color: "#fff",
            fillColor: ROUTE_COLOR,
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Tooltip
            permanent
            direction="center"
            className="route-stop-label"
            offset={[0, 0]}
          >
            {stop.order}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
};

export default RouteLine;