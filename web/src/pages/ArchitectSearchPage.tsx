/**
 * ArchitectSearchPage
 *
 * Entry page for browsing monuments by architect.
 *
 * Responsibilities:
 * - Configure SplitMapLayout for architect-based filtering
 * - Define which Firestore field should be used ("architect")
 *
 * Architecture:
 *
 * ArchitectSearchPage
 *   └ SplitMapLayout
 *        ├ Left panel → list of architects
 *        └ Map → filtered monuments
 *
 * Behavior:
 *
 * User selects an architect
 *   ↓
 * SplitMapLayout updates selectedFilter
 *   ↓
 * MapView queries Firestore:
 *      where("architect", "==", selectedArchitect)
 *   ↓
 * Map updates with matching monuments
 *
 * Notes:
 * - No data fetching logic here
 * - Pure configuration layer
 * - Reused pattern for EraSearchPage and AreaSearchPage
 */

import { useEffect, useState } from "react";
import SplitMapLayout from "../components/layout/SplitMapLayout";
import FilterCard from "../components/FilterCards";
import { getUniqueFieldVaules } from "../services/filterService";

const SearchByArcitectPage = () => {
    const [architect, setArchitect] = useState<string[]>([]);

    useEffect(() => {
        getUniqueFieldVaules("architect").then(setArchitect);
    }, []);

    return (
        <SplitMapLayout filteredField="architect">
        {({ selectedFilter, setSelectedFilter }) => (
            <>
            
            <h2 className="text-2xl font-bold mb-4">
                Architects
            </h2>

            <div className="space-y-3">
                {architect.map((name) => (
                <FilterCard
                    key={name}
                    label={name}
                    selected={selectedFilter === name}
                    onClick={() =>
                    setSelectedFilter(
                        selectedFilter === name ? null : name
                  )
                }
              />
            ))}
          </div>
        </>
      )}
    </SplitMapLayout>
  );
};

export default SearchByArcitectPage;