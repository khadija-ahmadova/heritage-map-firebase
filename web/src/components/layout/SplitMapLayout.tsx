/**
 * SplitMapLayout Component
 *
 * Reusable page layout for all search-based pages (architect, era, area).
 *
 * Responsibilities:
 * - Provide a consistent two-column layout:
 *      LEFT: Filter panel (search + selectable filters)
 *      RIGHT: Interactive map
 * - Manage shared state between filters and map
 * - Pass selected filter values down to MapView
 *
 * Layout Structure:
 *
 * SplitMapLayout
 *   ├ LeftPanelHeader (search input + profile access)
 *   ├ FilterCard list (dynamic filter values)
 *   └ MapView (filtered monuments)
 *
 * State Management:
 *
 * selectedFilter (string | null)
 *   → updated when user selects a filter
 *   → passed to MapView
 *
 * filterField ("architect" | "period" | "location")
 *   → defines which Firestore field to query
 *
 * activeMonument  (Monuments | null)
 * - Handles focusing on a SINGLE monument from search
 * 
 * Data Flow:
 *
 * User clicks filter
 *   ↓
 * selectedFilter updated
 *   ↓
 * MapView triggers Firestore query
 *   ↓
 * Filtered monuments displayed on map
 *
 * Notes:
 * - Fully reusable across different search pages
 * - Only filterField changes per page
 * - Does NOT fetch data itself (delegates to MapView)
 */

import { useState } from "react";
import Mapview from "../map/MapView";
import LeftPanelHeader from "./LeftPanelHeader";
import type { Monuments } from "../../types/Monuments";
import type { FilterField } from "../../types/Filters";
//import { RouterProvider } from "react-router-dom";

interface Props {
    children: (props:{
        selectedFilter: string | null;
        setSelectedFilter: (value: string | null) => void;
    }) => React.ReactNode;

    filteredField: FilterField;
}

const SplitMapLayout = ({ children, filteredField }: Props) => {
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    
    // Shared state to track which monument the map should zoom to
    const [activeMonument, setActiveMonument] = useState<Monuments | null>(null);
    // <RouteProvider>
        return (
            <div className="flex h-screen">
                {/* LEFT PANEL (FILTER AND BUILDING CARDS)*/}
                <div className="w-1/2 bg-bg-seashell flex flex-col h-full">

                    {/* HEADER */}
                    <div className="bg-accent-bordeaux text-white p-4">
                        {/*  SEARCH SECTION */}
                        <LeftPanelHeader onMonumentSelect={(m) => setActiveMonument(m)}/>
                    </div>

                    {/* SCROLLABLE CONTENT */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {children( {selectedFilter, setSelectedFilter })}
                    </div>
                </div>

                {/* RIGHT PANEL (MAP) */}
                <div className="w-1/2 h-full"> 
                    <Mapview 
                        selectedFilter={selectedFilter}
                        filterField = {filteredField}
                        activeMonument={activeMonument}
                    />
                </div>

            </div>
        );
    //
};

export default SplitMapLayout;