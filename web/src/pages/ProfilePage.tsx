import { useParams } from 'react-router-dom';
import {
    BarChart3,
    Clock,
    Code,
    FileCode,
    ShieldCheck,
    Star,
    Users,
    Wallet,
    CreditCard,
    Hash,
    Server
} from 'lucide-react';
import { AgentGauge } from '../components/AgentGauge';

// Mock Data Types
interface AgentData {
    id: string;
    score: number;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    version: string;
    responseTime: string;
    capabilities: string[];
    storageCid: string;
    codeHash: string;
    audits: { date: string; action: string; result: string }[];
}

const MOCK_AGENT: AgentData = {
    id: "8c7f...3a21",
    score: 945,
    tier: 'PLATINUM',
    version: "v2.1.0",
    responseTime: "450ms",
    capabilities: ["Natural Language Processing", "Autonomous Trading", "Cross-Chain Bridging"],
    storageCid: "ipfs://QmXyZ...8f9a",
    codeHash: "0x3a21...9b8c",
    audits: [
        { date: "2024-12-19 14:30", action: "Code Verification", result: "PASS" },
        { date: "2024-12-18 09:15", action: "Performance Check", result: "PASS" },
        { date: "2024-12-15 11:00", action: "Spam Detection", result: "CLEAR" },
    ]
};

export const ProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    // In real app, fetch data based on ID. For now use mock.
    const agent = MOCK_AGENT;

    return (
        <div className="container mx-auto pt-32 px-6 pb-20">
            {/* Header Panel */}
            <div className="bg-protex-surface border border-white/10 p-8 mb-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div>
                        <div className="mono-label mb-2 flex items-center gap-2">
                            AGENT ID
                            <span className="text-protex-primary font-bold">{id || agent.id}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-sans text-white tracking-tight mb-4">
                            AUTONOMOUS TRADER ALPHA
                        </h1>
                        <div className="flex gap-3">
                            <span className="bg-blue-900/40 text-blue-300 border border-blue-500/30 px-3 py-1 font-mono text-xs uppercase">
                                {agent.tier} TIER
                            </span>
                            <span className="bg-green-900/30 text-green-400 border border-green-500/30 px-3 py-1 font-mono text-xs uppercase">
                                ACTIVE
                            </span>
                        </div>
                    </div>

                    {/* Score Gauge */}
                    <div className="bg-black/30 p-4 border border-white/5 flex flex-col items-center">
                        <AgentGauge score={agent.score} size={140} />
                        <span className="mono-label mt-2">Trust Score</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Manifest */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-protex-surface p-6 border border-white/10">
                            <Clock className="w-6 h-6 text-protex-primary mb-3" />
                            <div className="text-2xl font-bold text-white mb-1">{agent.responseTime}</div>
                            <div className="mono-label">Avg Latency</div>
                        </div>
                        <div className="bg-protex-surface p-6 border border-white/10">
                            <Hash className="w-6 h-6 text-protex-primary mb-3" />
                            <div className="text-2xl font-bold text-white mb-1">{agent.version}</div>
                            <div className="mono-label">Version</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center space-x-2 text-gray-400 mb-1">
                                <BarChart3 className="w-4 h-4" />
                                <span className="text-sm">Success Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-white">99.8%</div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center space-x-2 text-gray-400 mb-1">
                                <Wallet className="w-4 h-4" />
                                <span className="text-sm">Total Staked</span>
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">1,000 LIN</div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center space-x-2 text-gray-400 mb-1">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-sm">Monthly Cost</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-400">5 LIN</div>
                        </div>
                        <div className="bg-protex-surface p-6 border border-white/10">
                            <Server className="w-6 h-6 text-protex-primary mb-3" />
                            <div className="text-2xl font-bold text-white mb-1">IPFS</div>
                            <div className="mono-label">Storage</div>
                        </div>
                    </div>

                    {/* Manifest Details */}
                    <div className="bg-protex-surface border border-white/10 p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Code className="w-5 h-5 text-protex-muted" /> Agent Manifest
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="mono-label mb-2">Capabilities</div>
                                <div className="flex flex-wrap gap-2">
                                    {agent.capabilities.map(cap => (
                                        <span key={cap} className="px-3 py-1 bg-white/5 border border-white/10 text-sm text-gray-300">
                                            {cap}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="mono-label mb-2">Code Hash</div>
                                    <div className="font-mono text-xs bg-black/50 p-3 border border-white/5 text-protex-primary truncate">
                                        {agent.codeHash}
                                    </div>
                                </div>
                                <div>
                                    <div className="mono-label mb-2">Storage CID</div>
                                    <div className="font-mono text-xs bg-black/50 p-3 border border-white/5 text-protex-accent truncate cursor-pointer hover:bg-white/5 transition-colors">
                                        {agent.storageCid}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="bg-protex-surface border border-white/10 p-6 h-fit">
                    <h3 className="text-lg font-bold text-white mb-6">Audit Log</h3>
                    <div className="space-y-4">
                        {agent.audits.map((audit, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div>
                                    <div className="text-sm font-medium text-white">{audit.action}</div>
                                    <div className="text-xs text-protex-muted font-mono">{audit.date}</div>
                                </div>
                                <span className={`text - xs font - bold px - 2 py - 1 ${audit.result === 'PASS' || audit.result === 'CLEAR'
                                        ? 'text-green-400 bg-green-900/20'
                                        : 'text-red-400 bg-red-900/20'
                                    } `}>
                                    {audit.result}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 border border-white/10 text-sm hover:bg-white/5 transition-colors text-protex-muted uppercase font-mono">
                        View Full History
                    </button>
                </div>
            </div>
        </div>
    );
};
