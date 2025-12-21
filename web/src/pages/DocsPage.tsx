import { useState } from 'react';
import { Book, Terminal, Server, Key, Shield, Wallet } from 'lucide-react';

export const DocsPage = () => {
    const [activeSection, setActiveSection] = useState('intro');

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    return (
        <div className="container mx-auto pt-32 px-6 pb-20 flex flex-col lg:flex-row gap-12">

            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
                <div className="sticky top-32 space-y-8">
                    <div>
                        <h5 className="mono-label mb-4 text-white">Getting Started</h5>
                        <ul className="space-y-2">
                            <li><button onClick={() => scrollToSection('intro')} className={`text-sm hover:text-protex-primary transition-colors ${activeSection === 'intro' ? 'text-protex-primary font-bold' : 'text-protex-muted'}`}>Introduction</button></li>
                            <li><button onClick={() => scrollToSection('architecture')} className={`text-sm hover:text-protex-primary transition-colors ${activeSection === 'architecture' ? 'text-protex-primary font-bold' : 'text-protex-muted'}`}>System Architecture</button></li>
                            <li><button onClick={() => scrollToSection('economy')} className={`text-sm hover:text-protex-primary transition-colors ${activeSection === 'economy' ? 'text-protex-primary font-bold' : 'text-protex-muted'}`}>Economic Security</button></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="mono-label mb-4 text-white">API Reference</h5>
                        <ul className="space-y-2">
                            <li><button onClick={() => scrollToSection('api-agents')} className={`text-sm hover:text-protex-primary transition-colors ${activeSection === 'api-agents' ? 'text-protex-primary font-bold' : 'text-protex-muted'}`}>List Agents</button></li>
                            <li><button onClick={() => scrollToSection('api-search')} className={`text-sm hover:text-protex-primary transition-colors ${activeSection === 'api-search' ? 'text-protex-primary font-bold' : 'text-protex-muted'}`}>Search & Filter</button></li>
                            <li><button onClick={() => scrollToSection('api-verify')} className={`text-sm hover:text-protex-primary transition-colors ${activeSection === 'api-verify' ? 'text-protex-primary font-bold' : 'text-protex-muted'}`}>Verify Commitment</button></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="mono-label mb-4 text-white">Guides</h5>
                        <ul className="space-y-2">
                            <li><button onClick={() => scrollToSection('oracle')} className={`text-sm hover:text-protex-primary transition-colors ${activeSection === 'oracle' ? 'text-protex-primary font-bold' : 'text-protex-muted'}`}>Oracle Bridge</button></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow max-w-3xl space-y-16">

                {/* Introduction */}
                <section id="intro" className="space-y-6">
                    <div className="flex items-center gap-3 text-protex-primary mb-2">
                        <Book className="w-5 h-5" />
                        <span className="mono-label">DOCUMENTATION</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        RegistrAI Developer Hub
                    </h1>
                    <p className="text-xl text-protex-muted leading-relaxed">
                        Welcome to the definitive on-chain registry for Autonomous Agents. built on Linera Microchains.
                        Integrate programmable trust into your dApps, DeFi protocols, and AI swarms.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="bg-protex-surface p-6 border border-white/10 rounded-sm">
                            <Shield className="w-8 h-8 text-protex-accent mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Reputation Layer</h3>
                            <p className="text-sm text-protex-muted">Query verifiable trust scores and performance metrics for any agent.</p>
                        </div>
                        <div className="bg-protex-surface p-6 border border-white/10 rounded-sm">
                            <Key className="w-8 h-8 text-protex-primary mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Identity Proofs</h3>
                            <p className="text-sm text-protex-muted">Cryptographic verification of agent code integrity and version history.</p>
                        </div>
                    </div>
                </section>

                <hr className="border-white/10" />

                {/* Architecture */}
                <section id="architecture" className="space-y-6">
                    <h2 className="text-3xl font-bold text-white">System Architecture</h2>
                    <p className="text-protex-muted leading-relaxed">
                        RegistrAI uses a Hub-and-Spoke model on Linera. The Registry Chain acts as the source of truth,
                        while individual Agent Chains submit activity logs.
                    </p>
                    <div className="bg-black/30 p-6 border border-white/5 font-mono text-sm text-gray-300 whitespace-pre overflow-x-auto">
                        {`Agent Chain                    Registry Hub Chain
    │                                │
    │ 1. LogTask(success=true)       │
    │ ─────────────────────────────► │
    │                                │ 2. Update score +1
    │                                │ 3. Recalculate tier
    │                                │`}
                    </div>

                </section>

                <hr className="border-white/10" />

                {/* Economic Security */}
                <section id="economy" className="space-y-6">
                    <h2 className="text-3xl font-bold text-white">Economic Security</h2>
                    <p className="text-protex-muted leading-relaxed">
                        RegistrAI enforces honest behavior through a cryptographic staking and slashing mechanism using the Linera Native Token.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-protex-surface p-6 border border-white/10 rounded-sm">
                            <h4 className="flex items-center gap-2 text-emerald-400 font-bold mb-3">
                                <Wallet className="w-5 h-5" /> Staking
                            </h4>
                            <p className="text-sm text-gray-400">
                                Agents must lock a security bond (Stake) to register. Higher stakes signal higher commitment and trust.
                            </p>
                        </div>
                        <div className="bg-protex-surface p-6 border border-white/10 rounded-sm">
                            <h4 className="flex items-center gap-2 text-red-400 font-bold mb-3">
                                <Shield className="w-5 h-5" /> Slashing
                            </h4>
                            <p className="text-sm text-gray-400">
                                If an agent provides malicious code or false logs, Governance can slash (burn) their stake, removing them from the registry.
                            </p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white pt-4">Monetization</h3>
                    <p className="text-protex-muted leading-relaxed">
                        Agents can set a <strong>Subscription Cost</strong>. Users pay this monthly fee on-chain to access the agent's services, ensuring a sustainable economy.
                    </p>
                </section>

                <hr className="border-white/10" />

                {/* API Reference */}
                <section id="api-ref" className="space-y-8">
                    <div className="flex items-center gap-3 text-protex-accent mb-2">
                        <Terminal className="w-5 h-5" />
                        <span className="mono-label">REST API v1</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">API Reference</h2>
                    <p className="text-protex-muted">
                        Our universal REST API allows any external system to query the registry.
                        Base URL: <code className="text-white bg-white/10 px-2 py-1 rounded">http://localhost:3001/api</code>
                    </p>

                    {/* List Agents */}
                    <div id="api-agents" className="bg-protex-surface border border-white/10 overflow-hidden">
                        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="bg-green-500/20 text-green-400 px-2 py-1 text-xs font-bold font-mono">GET</span>
                                <span className="text-white font-mono text-sm">/agents</span>
                            </div>
                            <span className="text-xs text-protex-muted uppercase font-mono">List Agents</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-protex-muted">Retrieve a paginated list of all registered agents.</p>
                            <div className="bg-black p-4 rounded border border-white/5 font-mono text-sm">
                                <span className="text-gray-400">$</span> curl http://localhost:3001/api/agents
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div id="api-search" className="bg-protex-surface border border-white/10 overflow-hidden">
                        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 text-xs font-bold font-mono">POST</span>
                                <span className="text-white font-mono text-sm">/agents/search</span>
                            </div>
                            <span className="text-xs text-protex-muted uppercase font-mono">Search & Filter</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-protex-muted">Find agents by tier, capability, or minimum score.</p>
                            <div className="bg-black p-4 rounded border border-white/5 font-mono text-sm">
                                <div className="text-gray-400 mb-2"># Find Platinum trading bots</div>
                                <span className="text-gray-400">$</span> curl -X POST http://localhost:3001/api/agents/search \
                                <br />&nbsp;&nbsp;-H "Content-Type: application/json" \
                                <br />&nbsp;&nbsp;-d '{"{"}
                                <br />&nbsp;&nbsp;&nbsp;&nbsp;"tier": "PLATINUM",
                                <br />&nbsp;&nbsp;&nbsp;&nbsp;"capability": "trading",
                                <br />&nbsp;&nbsp;&nbsp;&nbsp;"min_score": 800
                                <br />&nbsp;&nbsp;{"}"}'
                            </div>
                        </div>
                    </div>

                    {/* Verify */}
                    <div id="api-verify" className="bg-protex-surface border border-white/10 overflow-hidden">
                        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 text-xs font-bold font-mono">POST</span>
                                <span className="text-white font-mono text-sm">/agents/verify</span>
                            </div>
                            <span className="text-xs text-protex-muted uppercase font-mono">Verify Proof</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-protex-muted">Verify a signed commitment hash off-chain.</p>
                            <div className="bg-black p-4 rounded border border-white/5 font-mono text-sm">
                                <span className="text-gray-400">$</span> curl -X POST http://localhost:3001/api/agents/verify \
                                <br />&nbsp;&nbsp;-H "Content-Type: application/json" \
                                <br />&nbsp;&nbsp;-d '{"{"}
                                <br />&nbsp;&nbsp;&nbsp;&nbsp;"payload_data": {"{"} ... {"}"},
                                <br />&nbsp;&nbsp;&nbsp;&nbsp;"signature": "..."
                                <br />&nbsp;&nbsp;{"}"}'
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-white/10" />

                {/* Oracle Bridge */}
                <section id="oracle" className="space-y-6">
                    <div className="flex items-center gap-3 text-protex-primary mb-2">
                        <Server className="w-5 h-5" />
                        <span className="mono-label">ORACLE BRIDGE</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Cross-Chain Oracle</h2>
                    <p className="text-protex-muted leading-relaxed">
                        The Oracle Bridge allows smart contracts on other chains (like Base, Solana, Ethereum) to verify Linera reputation scores trustlessly.
                    </p>

                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-l-4 border-protex-primary p-6">
                        <h4 className="text-white font-bold mb-2">Example Use Case: DeFi Lending</h4>
                        <p className="text-sm text-gray-300">
                            A lending protocol on Base checks `Oracle.verify(agentId)` before approving an under-collateralized flash loan. Only agents with `PLATINUM` tier and `score &gt; 800` are approved.
                        </p>
                    </div>
                </section>

            </div >
        </div >
    );
};
