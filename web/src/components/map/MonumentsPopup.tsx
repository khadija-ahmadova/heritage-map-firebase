/**
 * MonumentsPopup Component
 *
 * Displays monument information inside a Leaflet popup when a marker
 * is clicked.
 *
 * This component acts as a small "card" UI containing monument details.
 *
 * Displayed information:
 * - Monument name
 * - Architect
 * - Historical period
 * - Location
 * - Style
 * - Link to monument detail page
 *
 * Used inside:
 * MonumentsMarker → Popup → MonumentPopup
 * DashboardPage → saved articles row → MonumentsPopup
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
      <h3 className="font-bold text-sm text-gray-900 mb-0.5">
        {monuments.name}
      </h3>
 
      <p className="text-xs text-gray-500 mb-0.5">{monuments.location}</p>
 
      <p className="text-xs text-gray-600">{monuments.architect}</p>
 
      <div className="flex flex-wrap gap-1 mt-2">
        {monuments.period && (
          <span className="text-[10px] bg-bg-seashell text-accent-brown px-2 py-0.5 rounded-full">
            {monuments.period}
          </span>
        )}
        {monuments.style && (
          <span className="text-[10px] bg-bg-seashell text-accent-brown px-2 py-0.5 rounded-full">
            {monuments.style}
          </span>
        )}
      </div>
 
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