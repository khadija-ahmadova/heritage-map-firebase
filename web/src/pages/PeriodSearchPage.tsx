/**
 * PeriodSearchPage
 *
 * Entry page for browsing monuments by architect.
 *
 * Responsibilities:
 * - Configure SplitMapLayout for architect-based filtering
 * - Define which Firestore field should be used ("architect")
 *
 * Architecture:
 *
 * EraSearchPage
 *   └ SplitMapLayout
 *        ├ Left panel → list of eras
 *        └ Map → filtered monuments
 *
 * Behavior:
 *
 * User selects an era
 *   ↓
 * SplitMapLayout updates selectedFilter
 *   ↓
 * MapView queries Firestore:
 *      where("period", "==", selectedperiod)
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
import { getUniqueFieldValues } from "../services/filterService";

const SearchbyPeriodPage = () => {
    const [period, setperiod] = useState<string[]>([]);

    useEffect(() => {
        getUniqueFieldValues("period").then(setperiod);
    }, []);

    return (
        <SplitMapLayout filteredField="period">
        {({ selectedFilter, setSelectedFilter }) => (
            <>
            
            <h2 className="text-2xl font-bold mb-4">
                Period
            </h2>

            <div className="space-y-3">
                {period.map((name) => (
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

export default SearchbyPeriodPage;