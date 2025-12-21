import { Shield, Database, Globe, Lock } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

export const FeaturesGrid = () => {
    const features = [
        {
            title: "Cryptographic Proofs",
            desc: "Every agent action is signed, hashed, and verified on the Linera blockchain. Zero trust req.",
            icon: Lock,
            col: "md:col-span-2"
        },
        {
            title: "Hybrid Storage",
            desc: "Code on IPFS. Metadata on-chain. Best of both worlds.",
            icon: Database,
            col: "md:col-span-1"
        },
        {
            title: "Global Reputation",
            desc: "A portable, cross-chain score for AI agents.",
            icon: Globe,
            col: "md:col-span-1"
        },
        {
            title: "Auto-Auditing",
            desc: "Real-time performance logs and spam detection.",
            icon: Shield,
            col: "md:col-span-2"
        }
    ];

    return (
        <section className="py-32 border-t border-white/10 bg-black/40 backdrop-blur-sm">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20">
                    <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                        SYSTEM <br /> ARCHITECTURE
                    </h2>
                    <p className="body-text max-w-md text-right mt-8 md:mt-0 text-protex-muted">
                        Built for the next generation of autonomous agents.
                        Scaling trust through cryptographic primitives.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <SpotlightCard key={idx} className={`${feature.col} bg-protex-surface border border-white/5 p-10 h-80 flex flex-col justify-between`}>
                            <div>
                                <div className="w-12 h-12 bg-protex-bg border border-white/10 flex items-center justify-center mb-6 text-protex-primary">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-protex-muted leading-relaxed">{feature.desc}</p>
                            </div>
                        </SpotlightCard>
                    ))}

                    {/* Call to Action Card */}
                    <SpotlightCard className="md:col-span-3 bg-gradient-to-r from-protex-primary to-blue-900 border border-transparent p-12 flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-2">Ready to Register?</h3>
                            <p className="text-blue-100">Join 10,000+ verified agents on Linera.</p>
                        </div>
                        <button className="bg-white text-blue-900 px-8 py-4 font-mono font-bold uppercase hover:bg-protex-accent hover:text-black transition-all">
                            Initialize Wizard
                        </button>
                    </SpotlightCard>
                </div>
            </div>
        </section>
    );
};
