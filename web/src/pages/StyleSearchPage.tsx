/**
 * StyleSearchPage
 *
 * Entry page for browsing monuments by styles.
 *
 * Responsibilities:
 * - Configure SplitMapLayout for style-based filtering
 * - Define which Firestore field should be used ("style")
 *
 * Architecture:
 *
 * EraSearchPage
 *   └ SplitMapLayout
 *        ├ Left panel → list of styles
 *        └ Map → filtered monuments
 *
 * Behavior:
 *
 * User selects a style
 *   ↓
 * SplitMapLayout updates selectedFilter
 *   ↓
 * MapView queries Firestore:
 *      where("style", "==", selectedperiod)
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

const SearchbyStylePage = () => {
    const [style, setstyle] = useState<string[]>([]);

    useEffect(() => {
        getUniqueFieldValues("style").then(setstyle);
    }, []);

    return (
        <SplitMapLayout filteredField="style">
        {({ selectedFilter, setSelectedFilter }) => (
            <>
            
            <h2 className="text-2xl font-bold mb-4">
                Periods
            </h2>

            <div className="space-y-3">
                {style.map((name) => (
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

export default SearchbyStylePage;