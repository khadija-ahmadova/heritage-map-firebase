/**
 * MapView Component
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
import { MapContainer, TileLayer } from "react-leaflet";

import type { Monuments } from "../../types/Monuments";
import { getMonuments } from "../../services/monumentsService";
import BuildingMarker from "./MonumentsMarker";

import L from "leaflet"
//import markerIcon from "web/src/assets/images/icons/map-pin.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"

const DefaultIcon = L.icon({
    iconUrl: markerIcon
})

L.Marker.prototype.options.icon = DefaultIcon

const Mapview = () => {
    const [monuments, setMonuments] = useState<Monuments[]>([])

    // Fetch monuments from Firestore
    useEffect(() => {
        async function loadMonuments() {
            const data = await getMonuments()
            setMonuments(data)
        }

        loadMonuments()
    }, [])

    //
    return (
        <div className="h-[700px] w-full rounded-xl overflow-hidden">
            <MapContainer
                center={[40.371655182714406, 49.843992955618646]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%"}}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap constributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {monuments.map((monuments) => (
                    <BuildingMarker
                        key={monuments.id}
                        monuments={monuments}
                    />
                ))}
            </MapContainer>
        </div>
    )
}

export default Mapview
