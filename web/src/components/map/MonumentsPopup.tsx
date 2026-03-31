/**
 * MonumentsPopup Component
 *
 * Displays monument information inside a Leaflet popup when a marker
 * is clicked.
 *
 * This component acts as a small "card" UI containing monument details.
 *
 * Typical displayed information:
 * - Monument name
 * - Architect
 * - Historical period
 * - Location
 *
 * Future Enhancements:
 * - Monument image
 * - Link to monument detail page
 * - Historical description
 *
 * Used inside:
 * MonumentsMarker → Popup → MonumentPopup
 *
 * UI Framework:
 * - TailwindCSS for styling
 */

import { Link } from "react-router-dom";
import { type Monuments } from "../../types/Monuments";

interface  Props {
    monuments: Monuments
}
const MonumentsPopup = ({ monuments }: Props) => {
    return (
        <div className="w-52">

            <h3 className="font-bold text-sm">{monuments.name}</h3>

            <p className="text-xs text-gray-600">
                {monuments.architect}
            </p>

            <p className="text-xs text-gray-500">
                {monuments.period}
            </p>

            <Link
                to={`/monument/${monuments.id}`}
                className="mt-2 inline-block text-xs font-medium text-accent-bordeaux hover:underline"
            >
                View details →
            </Link>
        </div>
    )
}

export default MonumentsPopup