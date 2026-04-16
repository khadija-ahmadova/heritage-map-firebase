// MonumentPageHeader.tsx
//
// A self-contained always-bordeaux header used only on MonumentDetailPage.
// Unlike the main Header.tsx which starts transparent and transitions on scroll,
// this one is always solid bordeaux — appropriate for an article page that
// doesn't have a hero image at the top.
//
// Mirrors the same nav links and auth state as Header.tsx.

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { signOut } from "../../lib/auth";

const MonumentPageHeader = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  const linkClass = "text-sm font-medium text-white hover:text-white/70 transition-colors";
  const buttonClass = "ml-4 inline-flex items-center text-sm font-medium px-5 py-2 rounded-md border border-white text-white hover:bg-white/20 transition";

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] bg-accent-bordeaux shadow-md py-3">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6">

        {/* Logo */}
        <Link to="/" className="font-bold text-xl text-white">
          Heritage Maps
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkClass}>Home</Link>

          {!loading && (
            user ? (
              <>
                <Link to="/dashboard" className={linkClass}>Dashboard</Link>
                <button onClick={handleSignOut} className={buttonClass}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className={linkClass}>Sign in</Link>
                <Link to="/register" className={buttonClass}>
                  Create account
                </Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
};

export default MonumentPageHeader;