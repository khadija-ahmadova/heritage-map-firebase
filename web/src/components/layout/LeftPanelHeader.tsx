/**
 * LeftPanelHeader Component
 *
 * Top section of the filter panel (left side of SplitMapLayout).
 *
 * Responsibilities:
 * - Provide search input for filtering available options
 * - Provide access to user profile/dashboard
 * - Display authentication-aware UI
 *
 * Features:
 *
 * 1. Search Bar
 *    - Filters visible filter values (client-side)
 *    - Does NOT query Firestore directly
 *
 * 2. Profile / Auth Button
 *    - If user is logged in → navigates to dashboard
 *    - If not logged in → redirects to sign-in page
 *
 * Data Flow:
 *
 * User types in search
 *   ↓
 * Parent component filters displayed FilterCards
 *
 * User clicks profile icon
 *   ↓
 * Navigation depends on auth state
 *
 * Dependencies:
 * - useAuth() for user state
 * - react-router for navigation
 *
 * Notes:
 * - Pure UI + interaction layer
 * - Does not manage global state
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const LeftPanelHeader = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleProfileClick = () => {
        if (user) {
            navigate("/dashboard");
        } else {
            navigate("/sign-in");
        }
    };

    return (
        <div className="flex items-center  bg-white rounded-md px-3 py-2">

            {/* Search bar */}
            <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 rounded-md bg-white text-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-accent-bordeaux"
            />

            {/* Profile icon */}
            <button
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center"
            >
                👤
            </button>

        </div>
    );
};

export default LeftPanelHeader;