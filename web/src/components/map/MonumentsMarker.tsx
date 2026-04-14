/**
 * MonumentsMarker Component
 *
 * Renders a single marker on the map representing a monument.
 *
 * Each marker corresponds to one document from the Firestore
 * "monuments" collection.
 *
 * Responsibilities:
 * - Convert Firestore GeoPoint coordinates into Leaflet marker position
 * - Render marker at monument location
 * - Attach popup displaying monument information
 *
 * Marker Structure:
 *
 * Marker
 *   ↓
 * Popup
 *      ↓
 * MonumentsPopup component
 *
 * Props:
 * - monument: Monuments
 *
 * Notes:
 * - Coordinates come from Firestore GeoPoint objects.
 * - Defensive checks prevent rendering if coordinates are missing.
 *
 * Dependencies:
 * - React Leaflet Marker
 * - React Leaflet Popup
 * - MonumentsPopup component
 */


import { Marker, Popup } from "react-leaflet";
import type { Monuments } from "../../types/Monuments";
import BuildingPopup from "./MonumentsPopup";

interface Props {
    monuments: Monuments
    showRouteButton: boolean
}

const MonumentsMarker = ({ monuments, showRouteButton}: Props) => {
    const coords = monuments.coordinates;

    if (!coords){
        return null;
    }
    
    return (
        <Marker position={[coords.latitude, coords.longitude]}>
            <Popup>
                <BuildingPopup 
                    monuments={monuments}
                    showRouteButton={showRouteButton}
                />
            </Popup>
        </Marker>
    )
}

export default MonumentsMarker