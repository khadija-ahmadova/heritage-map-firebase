/**
 * DashboardPage
 *
 * Authenticated landing page. Shows:
 * - Narrow hero image with welcome text overlay (matches landing page style)
 * - Horizontally scrollable row of saved monument cards
 * - Two large buttons: Saved Routes
 *   and Build Routes
 *
 * Data:
 * - Saved monuments fetched from Firestore "saved_landmarks" collection
 *   (same collection MonumentDetailPage writes to via handleSaveToggle)
 *   Each doc: { user_uid, landmark_id, save_time }
 *   We join landmark_id → full monument via getMonumentById()
 *
 * Auth:
 * - Page is protected by ProtectedRoute in App.tsx
 * - useAuth() provides current user
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/useAuth";
import { signOut } from "../lib/auth";
import { getMonumentById } from "../services/monumentsService";
import type { Monuments } from "../types/Monuments";
import dashboardHero from "../assets/images/landing-page-hero.jpg";



// ─── Monument card (used in the saved articles row) ───────────────────────────

const SavedMonumentCard = ({ monument }: { monument: Monuments }) => (
  <div className="flex-shrink-0 w-44 bg-white rounded-xl border border-gray-100 overflow-hidden">
    {monument.imageUrl?.[0] ? (
      <img
        src={monument.imageUrl[0]}
        alt={monument.name}
        className="w-full h-28 object-cover"
      />
      ) : (
      <div className="w-full h-28 bg-bg-seashell flex items-center justify-center">
        {/* existing svg placeholder */}
      </div>
    )}
    <div className="w-full h-28 bg-bg-seashell flex items-center justify-center">
      <svg
        className="w-8 h-8 text-gray-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="10" width="18" height="11" rx="1" />
        <path d="M9 21V10M15 21V10M3 10l9-7 9 7" />
      </svg>
    </div>

    <div className="p-3">
      <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">
        {monument.name}
      </p>
      <p className="text-xs text-gray-500 mb-0.5">{monument.architect}</p>
      <p className="text-xs text-gray-400">{monument.location}</p>

      <div className="flex flex-wrap gap-1 mt-2">
        {monument.period && (
          <span className="text-[10px] bg-bg-seashell text-accent-brown px-2 py-0.5 rounded-full">
            {monument.period}
          </span>
        )}
        {monument.style && (
          <span className="text-[10px] bg-bg-seashell text-accent-brown px-2 py-0.5 rounded-full">
            {monument.style}
          </span>
        )}
      </div>

      <Link
        to={`/monument/${monument.id}`}
        className="mt-2 inline-block text-xs font-medium text-accent-bordeaux hover:underline"
      >
        View article →
      </Link>
    </div>
  </div>
);

// ─── Route action button ───────────────────────────────────────────────────────

const RouteButton = ({
  icon,
  title,
  subtitle,
  to,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  to?: string;
  disabled?: boolean;
}) => {
  const inner = (
    <div
      className={`flex-1 p-5 bg-white rounded-xl border border-gray-100 text-left transition-colors
        ${disabled ? "opacity-50 cursor-default" : "hover:bg-bg-seashell cursor-pointer"}`}
    >
      <div className="w-8 h-8 rounded-lg bg-[#f3e8ea] flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );

  if (disabled || !to) return inner;
  return <Link to={to} className="flex-1 no-underline">{inner}</Link>;
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedMonuments, setSavedMonuments] = useState<Monuments[]>([]);
  const [loadingMonuments, setLoadingMonuments] = useState(true);

  // Fetch saved_landmarks for this user, then join monument data
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchSaved = async () => {
      setLoadingMonuments(true);
      try {
        const q = query(
          collection(db, "saved_landmarks"),
          where("user_uid", "==", user.uid)
        );
        const snap = await getDocs(q);
        const ids: string[] = snap.docs.map((d) => d.data().landmark_id);

        const monuments = await Promise.all(ids.map((id) => getMonumentById(id)));
        if (!cancelled) {
          setSavedMonuments(monuments.filter((m): m is Monuments => m !== null));
        }
      } catch (err) {
        console.error("[DashboardPage] Failed to load saved monuments:", err);
      } finally {
        if (!cancelled) setLoadingMonuments(false);
      }
    };

    fetchSaved();
    return () => { cancelled = true; };
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  const displayName = user?.displayName ?? user?.email ?? "there";

  return (
    <div className="min-h-screen bg-bg-seashell">
 
      {/* ── Narrow hero ── */}
      <section
        className="relative h-48 bg-cover bg-center flex items-end"
        style={{ backgroundImage: `url(${dashboardHero})` }}
      >
        {/* Dark overlay — same pattern as LandingPage */}
        <div className="absolute inset-0 bg-black/50" />
 
        {/* Welcome text — sits at the bottom of the hero */}
        <div className="relative z-10 max-w-2xl mx-auto w-full px-6 pb-7">
          <h1 className="text-2xl font-bold text-white leading-tight mb-0.5">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-white/70">Your heritage map activity</p>
        </div>
      </section>
 
      {/* ── Page content ── */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16">
 
        {/* Saved articles */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Saved articles
        </p>
 
        {loadingMonuments ? (
          <p className="text-sm text-gray-400 mb-8">Loading…</p>
        ) : savedMonuments.length === 0 ? (
          <p className="text-sm text-gray-400 mb-8">
            No saved articles yet. Bookmark a monument to see it here.
          </p>
        ) : (
          <div
            className="flex gap-3 overflow-x-auto pb-2 mb-8"
            style={{ scrollbarWidth: "none" }}
          >
            {savedMonuments.map((m) => (
              <SavedMonumentCard key={m.id} monument={m} />
            ))}
          </div>
        )}
 
        {/* Routes */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Routes
        </p>
 
        <div className="flex gap-3">
          <RouteButton
            to="/saved-routes"
            title="Saved routes"
            subtitle="View on map"
            icon={
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                    className="w-6 h-6 text-accent-bordeaux">
                    <path d="M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z" />
                  </svg>
            }
          />
            <RouteButton
              to="/search-by-architect?mode=route"
              title="Build route"
              subtitle="Create a new route"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B2737" strokeWidth="2">
                  <circle cx="5" cy="5" r="2" />
                  <circle cx="19" cy="19" r="2" />
                  <path d="M5 7v5a7 7 0 0 0 14 0V7" />
                </svg>
              }
            />
        </div>
 
        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="mt-12 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
 
      </div>
    </div>
  );
}