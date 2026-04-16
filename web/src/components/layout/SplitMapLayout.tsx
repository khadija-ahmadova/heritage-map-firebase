import { useState, useEffect } from "react"; 
import { useSearchParams } from "react-router-dom"; 
import MapView from "../map/MapView";
import LeftPanelHeader from "./LeftPanelHeader";
import type { Monuments } from "../../types/Monuments";
import type { FilterField } from "../../types/Filters";
import RouteBuilderPanel from "../route/RouteBuilderPanel";

interface Props {
  children: (props: {
    selectedFilter: string | null;
    setSelectedFilter: (value: string | null) => void;
    setActiveMonument: (m: Monuments) => void;
  }) => React.ReactNode;
  filteredField: FilterField;
}

const SplitMapLayoutContent = ({ children, filteredField }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeMonument, setActiveMonument] = useState<Monuments | null>(null);

  const [buildingRoute, setBuildingRoute] = useState(false);

  const [searchParams] = useSearchParams();

 
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "route") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBuildingRoute(true);
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* LEFT PANEL */}
      <div className="w-1/2 bg-bg-seashell flex flex-col h-full border-r">

        {/* Header */}
        <div className="bg-accent-bordeaux text-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <LeftPanelHeader
                onMonumentSelect={(m) => setActiveMonument(m)}
              />
            </div>

            {/* now synced with URL */}
            <button
              onClick={() => setBuildingRoute((v) => !v)}
              className={`px-4 py-2 text-xs rounded-full border
                ${
                  buildingRoute
                    ? "bg-white text-accent-bordeaux"
                    : "text-white border-white/40"
                }`}
            >
              {buildingRoute ? "EXIT ROUTE" : "BUILD ROUTE"}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {buildingRoute ? (
            <RouteBuilderPanel />
          ) : (
            <div className="p-6">
              {children({ selectedFilter, setSelectedFilter, setActiveMonument })}
            </div>
          )}
        </div>
      </div>

      {/* MAP */}
      <div className="w-1/2 h-full">
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

const SplitMapLayout = (props: Props) => {
  return <SplitMapLayoutContent {...props} />;
};

export default SplitMapLayout;