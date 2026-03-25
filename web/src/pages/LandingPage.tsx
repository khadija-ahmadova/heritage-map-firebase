/**
 * LandingPage Component
 *
 * Main entry page of the web application.
 *
 * Page sections:
 *
 * 1. Hero Section
 *    - Background image
 *    - Welcome text
 *
 * 2. About Section
 *    - Description of the project
 *
 * 3. Database Navigation
 *    - Links to search monuments by architect, era and area.
 *
 * 4. Map Section
 *    - Interactive map showing monuments from Firestore
 *
 * Architecture:
 *
 * LandingPage
 *   ├ Header
 *   ├ Hero
 *   ├ About
 *   ├ Navigation
 *   ├ MapView
 *   └ Footer
 *
 * The page does not contain map logic directly.
 * All map functionality is delegated to MapView.
 */

import heroImage from "../assets/images/Landing page hero.jpg";
import architectImage from "../assets/images/architectsearch.png";
import eraImage from "../assets/images/SEARCH-BY-ERA.jpg";
import areaImage from "../assets/images/Search-by-area.jpg";

import { Link } from "react-router-dom";
import Mapview from "../components/map/MapView";

const LandingPage = () => {
    return (
        <>
            <section
                className="min-h-screen bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${heroImage})`}}
            >
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Centered Text */}
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-center text-4xl md:text-6xl font-bold mb-4">
                    Welcome to Heritage Maps 
                    </h1>
                </div>
            </section>

            <section className="py-24 bg-bg-seashell">
                <div className="max-w-6xl mx-auto px-6">

                    {/* Section Title */}
                    <h2 className="text-4xl font-bold mb-12 text-accent-bordeaux">
                        About the Project
                    </h2>

                    {/* Content Row */}
                    <div className="flex items-center gap-12">
                    
                        {/* Left Column (Text) */}
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-amber-900 mb-4">
                            An Interactive Database of Baku's Architectural Landmarks
                            </h3>
                        </div>

                        {/* Right Column (Image Placeholder) */}
                        <div className="flex-1">
                            <div className="h-64 bg-gray-300 rounded-lg"></div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Database Navigation */}
            <section className="py-24 bg-bg-seashell">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-7 text-accent-bordeaux">
                        Browse the Database by
                    </h2>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <Link
                            to="/search-by-architect"
                            className="group relative h-64 rounded-xl overflow-hidden"
                        >
                            {/* Background Image*/}
                            <img
                                src={architectImage}
                                alt="Search by Architects"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Dark Overlay*/}
                            <div className="absolute insert-0 bg-black/80 group-hover:bg-black/50 transition"/>

                            {/* Text Label*/}
                            <div className="relative z-10 flex items-center justify-center h-full">
                                <h3 className="text-3xl font-bold text-accent-bordeaux">
                                    Architect
                                </h3>
                            </div>

                        </Link>

                        <Link
                            to="/search-by-era"
                            className="group relative h-64 rounded-xl overflow-hidden"
                        >
                            {/* Background Image*/}
                            <img
                                src={eraImage}
                                alt="Search by Era"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Dark Overlay*/}
                            <div className="absolute insert-0 bg-black/10 group-hover:bg-black/50 transition"/>

                            {/* Text Label*/}
                            <div className="relative z-10 flex items-center justify-center h-full">
                                <h3 className="text-3xl font-bold text-accent-bordeaux">
                                    Era
                                </h3>
                            </div>
                        </Link>

                        <Link
                            to="/search-by-area"
                            className="group relative h-64 rounded-xl overflow-hidden"
                        >
                            {/* Background Image*/}
                            <img
                                src={areaImage}
                                alt="Search by Area"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Dark Overlay*/}
                            <div className="absolute insert-0 bg-black/10 group-hover:bg-black/50 transition"/>

                            {/* Text Label*/}
                            <div className="relative z-10 flex items-center justify-center h-full">
                                <h3 className="text-3xl font-bold text-accent-bordeaux">
                                    Area
                                </h3>
                            </div>
                        </Link>
                    </div>

                    {/*OpenStreetMap tiles*/}
                    <section className="py-24 bg-bg-seashell">
                        <div className="h-[500px] w-full">

                            <Mapview selectedFilter={null} filterField={"architect"}/>

                        </div>
                    </section>

                </div>
            </section>
        </>
    );
};

export default LandingPage;