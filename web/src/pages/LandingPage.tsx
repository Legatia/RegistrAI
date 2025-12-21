import { Background } from '../components/Background';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { Footer } from '../components/Footer';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-protex-bg font-sans selection:bg-protex-accent selection:text-black">
            <Background />
            <Navbar />

            <main>
                <HeroSection />
                <FeaturesGrid />
            </main>

            <Footer />
        </div>
    );
};
