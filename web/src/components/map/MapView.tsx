/**
 * MapView Component
 *
 * Note:
 * We use an internal 'MapController' component to access the 'useMap' hook
 * This hook allows to trigger Leaflet's flyTo() animation
 * whenever the 'activeMonument' prop changes.
 * 
 * Main interactive map component displaying monuments on the map.
 *
 * Responsibilities:
 * - Initialize the Leaflet map
 * - Load monument data from Firestore
 * - Render OpenStreetMap tiles
 * - Generate map markers for each monument
 *
 * Architecture:
 *
 * MapView
 *   ├ TileLayer (OpenStreetMap tiles)
 *   └ MonumentMarker components
 *          └ MonumentPopup
 *
 * Data Flow:
 *
 * Firestore
 *   ↓
 * monumentService
 *   ↓
 * MapView (state: monuments[])
 *   ↓
 * MonumentMarker
 *   ↓
 * Popup / MonumentCard
 *
 * Notes:
 * - Map centered on Baku by default.
 * - Markers are dynamically generated based on Firestore documents.
 * - Leaflet requires explicit container height to render correctly.
 *
 * Dependencies:
 * - React Leaflet
 * - MonumentMarker component
 * - monumentService
 *
 * Map Tiles:
 * OpenStreetMap
 * https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
 */



import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Monuments } from "../../types/Monuments";
import { getMonumentsByFilter } from "../../services/filterService";
import type { FilterField } from "../../types/Filters";
import BuildingMarker from "./MonumentsMarker";
import RouteLine from "./RouteLine";
import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import "leaflet/dist/leaflet.css"


/**
 *  THE HELPER COMPONENT
 * This component sits inside MapContainer to gain access to the map instance.
 */
const MapController = ({ activeMonument }: { activeMonument: Monuments | null}) => {
  const map = useMap();

  useEffect(() => {
    if (activeMonument && activeMonument.coordinates) {
      const { latitude, longitude } = activeMonument.coordinates;

      // flyTo - smooth Leaflet animation function
      map.flyTo([latitude, longitude], 17, {
        duration: 2, // secs
        easeLinearity: 0.25,
      });
    }
  }, [activeMonument, map]);

  return null;
}

const DefaultIcon = L.icon({
    iconUrl: markerIcon
})

L.Marker.prototype.options.icon = DefaultIcon

interface Props {
  selectedFilter: string | null;
  filterField: FilterField;
  activeMonument: Monuments | null
  showRouteButton?: boolean;
}

const MapView = ({ selectedFilter, filterField, activeMonument, showRouteButton = false }: Props) => {
  const [monuments, setMonuments] = useState<Monuments[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getMonumentsByFilter(filterField, selectedFilter)
      .then((data) => { if (isMounted) setMonuments(data); })
      .catch(console.error)
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [selectedFilter, filterField]);
 
  return (
    <div className="h-full w-full rounded-xl overflow-hidden">
      {loading && (
        <div className="absolute z-1000 bg-white p-2 m-2 rounded shadow">
          Loading...
        </div>
      )}
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
        <MapController activeMonument={activeMonument} />
        {monuments.map((m) => (
          <BuildingMarker
            key={m.id}
            monuments={m}
            showRouteButton={showRouteButton}
          />
        ))}
        {/* Renders polyline when route stops exist */}
        <RouteLine />
      </MapContainer>
    </div>
  );
};
 
export default MapView;