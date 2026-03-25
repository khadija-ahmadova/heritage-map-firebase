import Mapview from "../map/MapView";

interface Props {
    children: React.ReactNode;
}

const SplitMapLayout = ({ children}: Props) => {
    return (
        <div className="flex h-screen">
            {/* LEFT PANEL (FILTER AND BUILDING CARDS)*/}
            <div className="w-1/2 overflow-y-auto p-8">
                {children}
            </div>

            {/* RIGHT PANEL (MAP) */}
            <div className="w-1/2 sticky top-0 h-screen">
                <Mapview />
            </div>

        </div>
    );
};

export default SplitMapLayout;