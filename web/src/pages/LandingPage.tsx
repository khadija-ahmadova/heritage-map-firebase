import heroImage from "../assets/images/Landing page hero.jpg";

const LandingPage = () => {
    return (
        <div
            className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${heroImage})`}}
        >
            <div className="absolute inset-0 bg-black/50"></div>


            {/* Centered Text */}
            <div className="relative z-10 text-center text-white px-6">
                <h1 className="text-center text-4xl md:text-6xl font-bold mb-4">
                   Welcome to Heritage Maps 
                </h1>

            </div>
        </div>
    );
};

export default LandingPage;