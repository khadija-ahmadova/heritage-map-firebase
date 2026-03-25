/**
 * FilterCard Component
 *
 * UI component representing a single selectable filter option.
 *
 * Responsibilities:
 * - Display a filter value (e.g., architect name, era, location)
 * - Handle user interaction (selection)
 * - Reflect active/selected state visually
 *
 * Props:
 *
 * label (string)
 *   → Text displayed on the card
 *
 * isSelected (boolean)
 *   → Whether this card is currently active
 *
 * onClick ()
 *   → Callback to update selected filter
 *
 * Usage:
 *
 * Used inside SplitMapLayout to render a list of filters:
 *
 * FilterCard[]
 *   → generated dynamically from Firestore values
 *
 * Behavior:
 *
 * User clicks card
 *   ↓
 * onClick triggers
 *   ↓
 * selectedFilter updated in parent
 *   ↓
 * Map refreshes with new query
 *
 * Styling Notes:
 * - Typically styled as clickable cards or buttons
 * - Selected state should be visually distinct
 */

interface Props {
    label: string;
    selected: boolean;
    onClick: () => void;
}

const FilterCard = ({ label, selected, onClick}: Props) => {
    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-lg border cursor-pointer transition
                ${selected ? "bg-accent-bordeaux text-white" : "bg-white hover:bg-gray-100"}
                `}
        >
            {label}
        </div>
    );
};

export default FilterCard