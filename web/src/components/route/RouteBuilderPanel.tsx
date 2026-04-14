/**
 * RouteBuilderPanel
 *
 * Self-contained panel that replaces the filter list on search pages
 * when the user enters route-building mode.
 *
 * Shows:
 * - Ordered stop list with reorder + remove
 * - Transport mode picker
 * - Save button → writes to Firestore → shows share link
 * - Copy link button
 *
 * Reads/writes RouteContext — must be inside <RouteProvider>.
 */

import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useRoute, TRANSPORT_OPTIONS } from "../../context/RouteContext";
import type { TransportMode } from "../../context/RouteContext";
import { saveRoute } from "../../services/routeService";

// ─── Stop item ────────────────────────────────────────────────────────────────

const StopItem = ({
  name, order, isFirst, isLast, onRemove, onMoveUp, onMoveDown,
}: {
  name: string; order: number;
  isFirst: boolean; isLast: boolean;
  onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) => (
  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-3 py-2 mb-2">
    <div className="shrink-0 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
      {order}
    </div>
    <p className="flex-1 text-xs font-medium text-gray-800 min-w-0 truncate">{name}</p>
    <div className="flex items-center gap-1 shrink-0">
      <button onClick={onMoveUp} disabled={isFirst}
        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      <button onClick={onMoveDown} disabled={isLast}
        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <button onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const RouteBuilderPanel = () => {
  const { user } = useAuth();
  const {
    stops, totalDistanceKm, clearRoute,
    transportMode, setTransportMode,
    removeStop, moveStop,
  } = useRoute();

  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);

  const shareUrl = shareToken
    ? `${window.location.origin}/tour/${shareToken}`
    : null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!user || stops.length < 2) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await saveRoute(user.uid, stops, transportMode);
      setShareToken(result.shareToken);
    } catch {
      setSaveError("Failed to save route. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    clearRoute();
    setShareToken(null);
    setSaveError(null);
  };

  // ── After save: show share link ──
  if (shareToken && shareUrl) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
          <p className="text-sm font-semibold text-gray-900 mb-1">Route saved!</p>
          <p className="text-xs text-gray-500 mb-3">
            Share this link with others. They'll need to be logged in to view it.
          </p>

          {/* Share URL box */}
          <div className="bg-bg-seashell rounded-lg px-3 py-2 mb-3 break-all">
            <p className="text-xs text-accent-bordeaux font-mono">{shareUrl}</p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-2 bg-accent-bordeaux text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Build another route
        </button>
      </div>
    );
  }

  // ── Building state ──
  return (
    <div className="p-4">

      {stops.length === 0 ? (
        <div className="text-center mt-8 px-2">
          <p className="text-sm text-gray-500">
            Click a monument on the map and press{" "}
            <span className="font-semibold text-accent-bordeaux">+ Add to Route</span>{" "}
            in the popup.
          </p>
        </div>
      ) : (
        <>
          {/* Stop count + distance */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Stops · {stops.length} · ~{totalDistanceKm} km
          </p>

          {/* Stop list */}
          {stops.map((stop, i) => (
            <StopItem
              key={stop.monument.id}
              name={stop.monument.name}
              order={stop.order}
              isFirst={i === 0}
              isLast={i === stops.length - 1}
              onRemove={() => removeStop(stop.monument.id)}
              onMoveUp={() => moveStop(i, i - 1)}
              onMoveDown={() => moveStop(i, i + 1)}
            />
          ))}

          {/* Transport mode */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-5 mb-3">
            Transport Mode
          </p>
          <div className="flex gap-2 mb-5">
            {TRANSPORT_OPTIONS.map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => setTransportMode(mode as TransportMode)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold transition-colors
                  ${transportMode === mode
                    ? "bg-accent-bordeaux text-white border-accent-bordeaux"
                    : "bg-white text-gray-600 border-gray-200 hover:border-accent-bordeaux"
                  }`}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Errors */}
          {saveError && (
            <p className="text-xs text-red-500 mb-2">{saveError}</p>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={stops.length < 2 || saving || !user}
            className="w-full py-3 bg-accent-bordeaux text-white text-sm font-semibold rounded-xl
              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {saving ? "Saving…" : "Save & Get Share Link"}
          </button>

          {!user && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Sign in to save and share routes
            </p>
          )}

          {stops.length < 2 && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Add at least 2 stops to save
            </p>
          )}

          <button
            onClick={handleReset}
            className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear all stops
          </button>
        </>
      )}
    </div>
  );
};

export default RouteBuilderPanel;