import { Link } from "react-router-dom";
import { type Monuments } from "../../types/Monuments";
import { useRoute } from "../../context/RouteContext";

interface Props {
  monuments: Monuments;
  showRouteButton?: boolean;
}

const MonumentsPopup = ({ monuments, showRouteButton = false }: Props) => {
  const { addStop, isInRoute } = useRoute();
  const alreadyAdded = isInRoute(monuments.id);

  return (
    <div className="w-52">
      <h3 className="font-bold text-sm text-gray-900 mb-0.5">
        {monuments.name}
      </h3>

      <p className="text-xs text-gray-500 mb-0.5">{monuments.location}</p>
      <p className="text-xs text-gray-600">{monuments.architect}</p>

      <div className="flex flex-wrap gap-1 mt-2">
        {monuments.period && (
          <span className="text-[10px] bg-bg-seashell text-accent-brown px-2 py-0.5 rounded-full">
            {monuments.period}
          </span>
        )}
        {monuments.style && (
          <span className="text-[10px] bg-bg-seashell text-accent-brown px-2 py-0.5 rounded-full">
            {monuments.style}
          </span>
        )}
      </div>

      {/* ✅ ONLY SHOW IN BUILD MODE */}
      {showRouteButton && (
        <button
          onClick={() => addStop(monuments)}
          disabled={alreadyAdded}
          className={`mt-2 w-full text-xs font-semibold px-3 py-1.5 rounded-full border transition
            ${
              alreadyAdded
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-accent-bordeaux text-white hover:opacity-90"
            }`}
        >
          {alreadyAdded ? "Added" : "+ Add to Route"}
        </button>
      )}

      <Link
        to={`/monument/${monuments.id}`}
        className="mt-2 inline-block text-xs font-medium text-accent-bordeaux hover:underline"
      >
        View details →
      </Link>
    </div>
  );
};

export default MonumentsPopup;