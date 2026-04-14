import { useState } from "react";
import MapView from "../map/MapView"; // Ensure casing matches your file name
import LeftPanelHeader from "./LeftPanelHeader";
import type { Monuments } from "../../types/Monuments";
import type { FilterField } from "../../types/Filters";
import { RouteProvider } from "../../context/RouteContext";
import RouteBuilderPanel from "../route/RouteBuilderPanel";

interface Props {
  children: (props: {
    selectedFilter: string | null;
    setSelectedFilter: (value: string | null) => void;
  }) => React.ReactNode;
  filteredField: FilterField;
}

/**
 * 1. INTERNAL CONTENT COMPONENT
 * This component handles the UI and State, but it MUST live 
 * inside the RouteProvider to use route hooks.
 */
const SplitMapLayoutContent = ({ children, filteredField }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeMonument, setActiveMonument] = useState<Monuments | null>(null);
  const [buildingRoute, setBuildingRoute] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className="w-1/2 bg-bg-seashell flex flex-col h-full border-r border-gray-200">
        
        {/* Header Section */}
        <div className="bg-accent-bordeaux text-white p-4 shadow-md z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <LeftPanelHeader onMonumentSelect={(m) => setActiveMonument(m)} />
            </div>

            <button
              onClick={() => setBuildingRoute((v) => !v)}
              className={`flex-shrink-0 flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all
                ${buildingRoute
                  ? "bg-white text-accent-bordeaux border-white shadow-lg"
                  : "bg-transparent text-white border-white/40 hover:border-white"
                }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="5" cy="5" r="2" />
                <circle cx="19" cy="19" r="2" />
                <path d="M5 7v5a7 7 0 0 0 14 0V7" />
              </svg>
              {buildingRoute ? "EXIT ROUTE" : "BUILD ROUTE"}
            </button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto">
          {buildingRoute ? (
            <RouteBuilderPanel />
          ) : (
            <div className="p-6">
              {children({ selectedFilter, setSelectedFilter })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL (MAP) ── */}
      <div className="w-1/2 h-full relative">
        <MapView
          selectedFilter={selectedFilter}
          filterField={filteredField}
          activeMonument={activeMonument}
          showRouteButton={buildingRoute} 
        />
      </div>
    </div>
  );
};

/**
 * 2. EXPORTED LAYOUT COMPONENT
 * This wraps everything in the RouteProvider so that MapView, 
 * RouteLine, and RouteBuilderPanel can all access the context safely.
 */
const SplitMapLayout = (props: Props) => {
  return (
    <RouteProvider>
      <SplitMapLayoutContent {...props} />
    </RouteProvider>
  );
};

export default SplitMapLayout;