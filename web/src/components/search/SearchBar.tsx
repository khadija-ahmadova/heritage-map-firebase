/**
 * SearchBar Component
 * 
 * Features: 
 * - Live search suggestions with debounced Firestore queries
 * - Multi-field search (name, architect, period)
 * - Returns full Monument object on selection to enable map "fly-to"
 */

import { useEffect, useState } from "react";
import { searchMonuments } from "../../services/filterService";
import type { Monuments } from "../../types/Monuments";

interface Props {
    // Passes the entire object so the parent knows the coordinates
    onSelect: (item: Monuments) => void;
}

const SearchBar = ({ onSelect}: Props) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Monuments[]>([]);
    const [loading, setLoading] = useState(false);

    //Debounce
    useEffect(() => {
        const delay = setTimeout(() => {
            if (!query.trim()) {
                setResults([]);
                return
            }

            setLoading(true);

            searchMonuments(query)
                .then(setResults)
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(delay);
    }, [query]);

    return (
        <div className="relative w-full">
            {/* Input */}
            <input
                type="text"
                placeholder="Search monuments, architects, periods..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white text-black placeholder-gray-400 outline-none"    
            />

            {/* Suggestions */}
            {results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-md max-h-64 overflow-y-auto z-50 text-accent-bordeaux">
                    {results.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                onSelect(item);
                                setQuery("");
                                setResults([]);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-black">
                                {item.architect} • {item.period}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <div className="absolute top-full mt-2 text-sm text-white">
                    Loading...
                </div>
            )}
        </div>
    );
};

export default SearchBar;