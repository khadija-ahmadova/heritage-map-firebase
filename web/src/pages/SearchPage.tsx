import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SplitMapLayout from "../components/layout/SplitMapLayout";
import FilterCard from "../components/FilterCards";
import { getMonumentsByFilter } from "../services/filterService";
import type { Monuments } from "../types/Monuments";

const SearchPage = () => {
  const [monuments, setMonuments] = useState<Monuments[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const navigate = useNavigate();

  // NEW: fetch ALL monuments (no filter)
  useEffect(() => {
    getMonumentsByFilter("architect", null).then(setMonuments);
  }, []);

  return (
    <SplitMapLayout filteredField="architect">
      {( {setActiveMonument}) => (
        <>
          {/*  FILTER NAV BUTTONS */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => navigate("/search-by-architect")}
              className="px-3 py-2 text-xs bg-accent-bordeaux  text-amber-50 border rounded"
            >
              Architect
            </button>

            <button
              onClick={() => navigate("/search-by-period")}
              className="px-3 py-2 text-xs bg-accent-bordeaux  text-amber-50 border rounded"
            >
              Period
            </button>

            <button
              onClick={() => navigate("/search-by-style")}
              className="px-3 py-2 text-xs bg-accent-bordeaux  text-amber-50 border rounded"
            >
              Style
            </button>
          </div>

          {/* MONUMENT LIST */}
            <div className="space-y-3">
            {monuments.map((m) => (
              <FilterCard
                key={m.id}
                label={m.name}

                // 🔴 HIGHLIGHT SELECTED
                selected={selectedId === m.id}

                onClick={() => {
                  setSelectedId(m.id); // 🔴 highlight
                  setActiveMonument(m); // 🔴 trigger map flyTo
                }}
              />
            ))}
          </div>
        </>
      )}
    </SplitMapLayout>
  );
};

export default SearchPage;