// Header.tsx — Scroll-aware top navigation bar
//
// Behavior:
//   - Transparent with white text when at the top of the page
//   - Bordeaux background when scrolled past 50px
//   - Shows "Sign in" / "Register" buttons when logged out
//   - Shows "Dashboard" + "Build Route" + "Sign out" when logged in

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { signOut } from "../lib/auth";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  const linkClass = "text-sm font-medium text-white hover:text-gray-300 transition-colors";
  const buttonClass = `ml-4 inline-flex items-center text-sm font-medium px-5 py-2 rounded-md border border-white text-white hover:bg-white/20 transition`;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-1000 transition-all duration-300
      ${scrolled ? "bg-accent-bordeaux shadow-md py-3" : "bg-transparent py-5"}`}
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6">

        {/* Logo */}
        <Link to="/" className="font-bold text-xl text-white">
          Heritage Maps
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkClass}>Home</Link>
          <Link to="/search" className={linkClass}>Explore</Link>          

          {/* Don't render auth buttons while Firebase is restoring the session */}
          {!loading && (
            user ? (
              // Logged-in state
              <>
                <Link to="/dashboard" className={linkClass}>Dashboard</Link>
                <Link
                  to="/search-by-architect?mode=route"
                  className={linkClass}
                >
                  Build Route
                </Link>
                <button onClick={handleSignOut} className={buttonClass}>
                  Sign out
                </button>
              </>
            ) : (
              // Logged-out state
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

export default Header;
