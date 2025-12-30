import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Shield, Loader2, AlertCircle } from 'lucide-react';
import { listAgents, searchAgents, type Agent } from '../utils/api';
import { AgentGauge } from '../components/AgentGauge';

const TIERS = ['ALL', 'PLATINUM', 'GOLD', 'VERIFIED', 'UNVERIFIED'] as const;

const tierColors: Record<string, string> = {
    PLATINUM: 'bg-purple-900/40 text-purple-300 border-purple-500/30',
    GOLD: 'bg-yellow-900/40 text-yellow-300 border-yellow-500/30',
    VERIFIED: 'bg-blue-900/40 text-blue-300 border-blue-500/30',
    UNVERIFIED: 'bg-gray-800/40 text-gray-400 border-gray-600/30',
};

export const AgentListPage = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTier, setSelectedTier] = useState<string>('ALL');

    useEffect(() => {
        loadAgents();
    }, [selectedTier]);

    const loadAgents = async () => {
        setLoading(true);
        setError(null);
        try {
            let result: Agent[];
            if (selectedTier === 'ALL') {
                result = await listAgents();
            } else {
                result = await searchAgents({ tier: selectedTier });
            }
            setAgents(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="container mx-auto pt-32 px-6 pb-20">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px w-12 bg-protex-accent" />
                    <span className="mono-label text-protex-accent">AGENT REGISTRY</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                    Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-protex-primary to-protex-accent">Agents</span>
                </h1>
                <p className="text-protex-muted max-w-2xl">
                    Explore verified AI agents on the RegistrAI network. Filter by reputation tier or search by capability.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-protex-muted" />
                    <input
                        type="text"
                        placeholder="Search by name or capability..."
                        className="w-full bg-protex-surface border border-white/10 pl-12 pr-4 py-3 text-white placeholder:text-protex-muted focus:border-protex-primary focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-protex-muted" />
                    <div className="flex gap-2">
                        {TIERS.map(tier => (
                            <button
                                key={tier}
                                onClick={() => setSelectedTier(tier)}
                                className={`px-4 py-2 font-mono text-xs uppercase border transition-colors ${selectedTier === tier
                                        ? 'bg-protex-primary border-protex-primary text-white'
                                        : 'border-white/10 text-protex-muted hover:border-white/30'
                                    }`}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-protex-primary animate-spin" />
                    <span className="ml-3 text-protex-muted">Loading agents...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/30 p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <p className="text-red-300">{error}</p>
                    <button
                        onClick={loadAgents}
                        className="mt-4 px-4 py-2 border border-red-500/30 text-red-300 hover:bg-red-900/20"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredAgents.length === 0 && (
                <div className="bg-protex-surface border border-white/10 p-12 text-center">
                    <Shield className="w-12 h-12 text-protex-muted mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Agents Found</h3>
                    <p className="text-protex-muted mb-6">
                        {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to register an agent!'}
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-white text-black px-6 py-3 font-mono font-bold uppercase hover:bg-protex-accent transition-colors"
                    >
                        Register Agent
                    </Link>
                </div>
            )}

            {/* Agent Grid */}
            {!loading && !error && filteredAgents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents.map(agent => (
                        <Link
                            key={agent.id}
                            to={`/agent/${agent.id}`}
                            className="bg-protex-surface border border-white/10 p-6 hover:border-protex-primary/50 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-protex-accent transition-colors">
                                        {agent.name}
                                    </h3>
                                    <p className="mono-label text-xs truncate max-w-[180px]">
                                        ID: {agent.id.slice(0, 8)}...
                                    </p>
                                </div>
                                <AgentGauge score={agent.reputation_score} size={60} />
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`px-2 py-1 text-xs font-mono uppercase border ${tierColors[agent.tier]}`}>
                                    {agent.tier}
                                </span>
                                <span className="px-2 py-1 text-xs font-mono text-protex-muted border border-white/10">
                                    v{agent.version}
                                </span>
                            </div>

                            {agent.capabilities.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {agent.capabilities.slice(0, 3).map(cap => (
                                        <span key={cap} className="text-xs text-protex-muted bg-white/5 px-2 py-1">
                                            {cap}
                                        </span>
                                    ))}
                                    {agent.capabilities.length > 3 && (
                                        <span className="text-xs text-protex-muted">
                                            +{agent.capabilities.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}

            {/* Results count */}
            {!loading && !error && filteredAgents.length > 0 && (
                <div className="mt-8 text-center">
                    <span className="mono-label">
                        Showing {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
                    </span>
                </div>
            )}
        </div>
    );
};
