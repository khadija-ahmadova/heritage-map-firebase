import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
      ${
        scrolled
          ? "bg-white shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6">

        {/* Logo */}
        <Link
          to="/"
          className={`font-bold text-xl transition-colors duration-300 ${
            scrolled ? "text-black" : "text-white"
          }`}
        >
          Heritage Maps
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-gray-700 hover:text-black" : "text-white hover:text-gray-300"
            }`}
          >
            Home
          </Link>
          <Link
            to="/advanced-search"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-gray-700 hover:text-black" : "text-white hover:text-gray-300"
            }`}
          >
            Advanced Search
          </Link>
          
            <Link
            to="/sign-in"
            className={`ml-4 inline-flex items-center text-sm font-medium px-5 py-2 rounded-md transition ${
                scrolled
                    ? "border border-gray-400 text-black hover:bg-gray-100"
                    : "border border-white text-white hover:bg-white/20"
            }`}
        >
    Login / Sign In
  </Link>
            
        </nav>
      </div>
    </header>
  );
};

export default Header;