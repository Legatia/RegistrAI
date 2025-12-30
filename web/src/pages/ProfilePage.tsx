import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    BarChart3,
    Clock,
    Code,
    Hash,
    Server,
    Wallet,
    CreditCard,
    Loader2,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { AgentGauge } from '../components/AgentGauge';
import { getAgent, getAgentCommitment, type Agent, type ScoreCommitment } from '../utils/api';

const tierColors: Record<string, string> = {
    PLATINUM: 'bg-purple-900/40 text-purple-300 border-purple-500/30',
    GOLD: 'bg-yellow-900/40 text-yellow-300 border-yellow-500/30',
    VERIFIED: 'bg-blue-900/40 text-blue-300 border-blue-500/30',
    UNVERIFIED: 'bg-gray-800/40 text-gray-400 border-gray-600/30',
};

export const ProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const [agent, setAgent] = useState<Agent | null>(null);
    const [commitment, setCommitment] = useState<ScoreCommitment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadAgent(id);
        }
    }, [id]);

    const loadAgent = async (agentId: string) => {
        setLoading(true);
        setError(null);
        try {
            const agentData = await getAgent(agentId);
            setAgent(agentData);

            // Also fetch commitment
            try {
                const commitmentData = await getAgentCommitment(agentId);
                setCommitment(commitmentData);
            } catch {
                // Commitment is optional, don't fail if not available
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load agent');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto pt-40 px-6 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-protex-primary animate-spin" />
                <span className="ml-3 text-protex-muted">Loading agent...</span>
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="container mx-auto pt-40 px-6">
                <div className="max-w-md mx-auto text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
                    <p className="text-protex-muted mb-8">
                        {error || 'The requested agent could not be found.'}
                    </p>
                    <Link
                        to="/agents"
                        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono font-bold uppercase hover:bg-protex-accent transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Browse Agents
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto pt-32 px-6 pb-20">
            {/* Back Link */}
            <Link
                to="/agents"
                className="inline-flex items-center gap-2 text-protex-muted hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Registry
            </Link>

            {/* Header Panel */}
            <div className="bg-protex-surface border border-white/10 p-8 mb-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div>
                        <div className="mono-label mb-2 flex items-center gap-2">
                            AGENT ID
                            <span className="text-protex-primary font-bold">{agent.id.slice(0, 12)}...</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-sans text-white tracking-tight mb-4">
                            {agent.name}
                        </h1>
                        {agent.description && (
                            <p className="text-protex-muted mb-4 max-w-xl">{agent.description}</p>
                        )}
                        <div className="flex gap-3">
                            <span className={`px-3 py-1 font-mono text-xs uppercase border ${tierColors[agent.tier]}`}>
                                {agent.tier} TIER
                            </span>
                            <span className="bg-green-900/30 text-green-400 border border-green-500/30 px-3 py-1 font-mono text-xs uppercase">
                                ACTIVE
                            </span>
                        </div>
                    </div>

                    {/* Score Gauge */}
                    <div className="bg-black/30 p-4 border border-white/5 flex flex-col items-center">
                        <AgentGauge score={agent.reputation_score} size={140} />
                        <span className="mono-label mt-2">Trust Score</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Manifest */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-protex-surface p-6 border border-white/10">
                            <Hash className="w-6 h-6 text-protex-primary mb-3" />
                            <div className="text-2xl font-bold text-white mb-1">{agent.version}</div>
                            <div className="mono-label">Version</div>
                        </div>
                        <div className="bg-protex-surface p-6 border border-white/10">
                            <Server className="w-6 h-6 text-protex-primary mb-3" />
                            <div className="text-2xl font-bold text-white mb-1">{agent.storage_provider || 'N/A'}</div>
                            <div className="mono-label">Storage</div>
                        </div>
                        <div className="bg-protex-surface p-6 border border-white/10">
                            <BarChart3 className="w-6 h-6 text-protex-primary mb-3" />
                            <div className="text-2xl font-bold text-white mb-1">
                                {agent.tasks_completed > 0
                                    ? `${((agent.tasks_completed / (agent.tasks_completed + agent.tasks_failed)) * 100).toFixed(1)}%`
                                    : 'N/A'}
                            </div>
                            <div className="mono-label">Success Rate</div>
                        </div>
                        <div className="bg-protex-surface p-6 border border-white/10">
                            <Clock className="w-6 h-6 text-protex-primary mb-3" />
                            <div className="text-2xl font-bold text-white mb-1">{agent.tasks_completed}</div>
                            <div className="mono-label">Tasks Done</div>
                        </div>
                        <div className="bg-protex-surface p-6 border border-white/10">
                            <Wallet className="w-6 h-6 text-protex-primary mb-3" />
                            <div className="text-2xl font-bold text-emerald-400 mb-1">0 LIN</div>
                            <div className="mono-label">Staked</div>
                        </div>
                        <div className="bg-protex-surface p-6 border border-white/10">
                            <CreditCard className="w-6 h-6 text-protex-primary mb-3" />
                            <div className="text-2xl font-bold text-blue-400 mb-1">{agent.runtime}</div>
                            <div className="mono-label">Runtime</div>
                        </div>
                    </div>

                    {/* Manifest Details */}
                    <div className="bg-protex-surface border border-white/10 p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Code className="w-5 h-5 text-protex-muted" /> Agent Manifest
                        </h3>

                        <div className="space-y-6">
                            {agent.capabilities.length > 0 && (
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
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="mono-label mb-2">Code Hash</div>
                                    <div className="font-mono text-xs bg-black/50 p-3 border border-white/5 text-protex-primary break-all">
                                        {agent.code_hash}
                                    </div>
                                </div>
                                {agent.storage_cid && (
                                    <div>
                                        <div className="mono-label mb-2">Storage CID</div>
                                        <div className="font-mono text-xs bg-black/50 p-3 border border-white/5 text-protex-accent truncate cursor-pointer hover:bg-white/5 transition-colors">
                                            {agent.storage_cid}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Commitment & Actions */}
                <div className="space-y-6">
                    {commitment && (
                        <div className="bg-protex-surface border border-white/10 p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Score Commitment</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-protex-muted">Score</span>
                                    <span className="font-mono text-white">{commitment.score}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-protex-muted">Tier</span>
                                    <span className="font-mono text-white">{commitment.tier}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-protex-muted">Expires</span>
                                    <span className="font-mono text-xs text-protex-muted">
                                        {new Date(commitment.expires_at).toLocaleString()}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-white/10">
                                    <div className="mono-label mb-1">Commitment Hash</div>
                                    <code className="text-xs text-protex-accent break-all">
                                        {commitment.commitment_hash.slice(0, 32)}...
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="bg-protex-surface border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-protex-muted">Registered</span>
                                <span className="font-mono text-xs text-white">
                                    {new Date(agent.registered_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-protex-muted">Last Updated</span>
                                <span className="font-mono text-xs text-white">
                                    {new Date(agent.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
