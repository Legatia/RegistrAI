import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setError('');

        try {
            // Try to find agent by ID
            const res = await fetch(`/api/agents/${searchQuery.trim()}`);

            if (res.ok) {
                const agent = await res.json();
                navigate(`/agent/${agent.id}`);
            } else if (res.status === 404) {
                setError('Agent not found');
            } else {
                setError('Search failed');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <section className="relative pt-40 pb-32 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px w-12 bg-protex-accent" />
                        <span className="mono-label text-protex-accent">
                            v1.0.0 Public Beta
                        </span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-bold text-white leading-[0.9] tracking-tighter mb-10">
                        GLOBAL <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-protex-primary to-white">
                            RegistrAI
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-protex-muted max-w-2xl leading-relaxed mb-12">
                        The definitive on-chain registry for Autonomous Intelligence.
                        Verify identity, track code iterations, and build programmable trust.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="relative group max-w-sm w-full">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-protex-primary to-protex-accent rounded-sm opacity-50 blur group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative flex items-center bg-protex-surface p-1">
                                <div className="pl-4 pr-2 text-protex-accent">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="ENTER AGENT ID..."
                                    className="w-full bg-transparent border-none py-4 px-4 text-white font-mono text-sm placeholder-protex-muted focus:outline-none uppercase"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={searching || !searchQuery.trim()}
                                    className="bg-white hover:bg-protex-accent hover:text-black text-black px-6 py-3 font-mono font-bold text-sm uppercase transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {searching ? (
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>Search <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mt-4 text-red-400 font-mono text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 right-10 flex flex-col items-center gap-2 hidden md:flex"
            >
                <span className="mono-label" style={{ writingMode: 'vertical-rl' }}>SCROLL</span>
                <div className="w-px h-20 bg-gradient-to-b from-protex-accent to-transparent" />
            </motion.div>
        </section>
    );
};
