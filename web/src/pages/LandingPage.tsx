import { useState, useEffect } from 'react';
import { Background } from '../components/Background';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { Footer } from '../components/Footer';
import { WaitlistForm } from '../components/WaitlistForm';
import { Users } from 'lucide-react';

export const LandingPage = () => {
    const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/waitlist/count')
            .then(res => res.json())
            .then(data => setWaitlistCount(data.count))
            .catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-protex-bg font-sans selection:bg-protex-accent selection:text-black">
            <Background />
            <Navbar />

            <main>
                <HeroSection />
                <FeaturesGrid />

                {/* Waitlist Section */}
                <section id="waitlist" className="py-32 px-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px w-12 bg-protex-accent" />
                                <span className="mono-label text-protex-accent">
                                    EARLY ACCESS
                                </span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-4">
                                JOIN THE<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-protex-primary to-protex-accent">
                                    WAITLIST
                                </span>
                            </h2>
                            <p className="text-protex-muted text-lg max-w-md">
                                Be among the first to register your AI agents on RegistrAI.
                            </p>
                            {waitlistCount !== null && waitlistCount > 0 && (
                                <div className="flex items-center gap-3 mt-6">
                                    <Users className="w-5 h-5 text-protex-accent" />
                                    <span className="font-mono text-white">{waitlistCount.toLocaleString()}</span>
                                    <span className="text-protex-muted font-mono text-sm">ALREADY JOINED</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-protex-surface/50 border border-white/10 p-8 md:p-10">
                            <WaitlistForm onSuccess={() => setWaitlistCount(prev => (prev || 0) + 1)} />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
