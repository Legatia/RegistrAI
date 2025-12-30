import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listAgents, type Agent } from '../utils/api';
import {
    Plus,
    Loader2,
    Link as LinkIcon,
    AlertCircle,
    User,
    ChevronRight,
    Shield
} from 'lucide-react';
import { AgentGauge } from '../components/AgentGauge';

const tierColors: Record<string, string> = {
    PLATINUM: 'text-purple-300',
    GOLD: 'text-yellow-300',
    VERIFIED: 'text-blue-300',
    UNVERIFIED: 'text-gray-400',
};

export const DashboardPage = () => {
    const { user, loading: authLoading, provisionChain } = useAuth();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(true);
    const [provisioning, setProvisioning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadUserAgents();
        }
    }, [user]);

    const loadUserAgents = async () => {
        setLoadingAgents(true);
        try {
            // Fetch all agents and filter by owner
            const allAgents = await listAgents(100, 0);
            const userAgents = allAgents.filter(a => a.owner_id === user?.id);
            setAgents(userAgents);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load agents');
        } finally {
            setLoadingAgents(false);
        }
    };

    const handleProvisionChain = async () => {
        setProvisioning(true);
        setError(null);
        try {
            const chainId = await provisionChain();
            if (!chainId) {
                setError('Failed to provision chain');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to provision chain');
        } finally {
            setProvisioning(false);
        }
    };

    if (authLoading) {
        return (
            <div className="container mx-auto pt-40 px-6 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-protex-primary animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto pt-40 px-6 text-center">
                <Shield className="w-16 h-16 text-protex-muted mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Authentication Required</h1>
                <p className="text-protex-muted mb-8">Please sign in to access your dashboard.</p>
                <Link
                    to="/"
                    className="inline-block bg-white text-black px-6 py-3 font-mono font-bold uppercase hover:bg-protex-accent transition-colors"
                >
                    Go Home
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto pt-32 px-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-px w-12 bg-protex-accent" />
                        <span className="mono-label text-protex-accent">DASHBOARD</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Welcome, <span className="text-protex-accent">{user.name || 'Agent Owner'}</span>
                    </h1>
                </div>

                <Link
                    to="/register"
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 font-mono font-bold uppercase hover:bg-protex-accent transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Register Agent
                </Link>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/30 p-4 mb-8 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: User Profile & Chain */}
                <div className="space-y-6">
                    {/* User Card */}
                    <div className="bg-protex-surface border border-white/10 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name || 'User'}
                                    className="w-16 h-16 rounded-full border-2 border-protex-primary"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-protex-primary/20 flex items-center justify-center">
                                    <User className="w-8 h-8 text-protex-primary" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-white">{user.name || 'Anonymous'}</h3>
                                <p className="text-sm text-protex-muted">{user.email}</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <div className="mono-label mb-2">Linera Chain</div>
                            {user.chainId ? (
                                <div className="flex items-center gap-2 bg-black/30 p-3 border border-white/5">
                                    <LinkIcon className="w-4 h-4 text-green-400" />
                                    <span className="font-mono text-xs text-protex-accent truncate">
                                        {user.chainId}
                                    </span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleProvisionChain}
                                    disabled={provisioning}
                                    className="w-full flex items-center justify-center gap-2 bg-protex-primary text-white py-3 font-mono uppercase hover:bg-protex-primary/80 disabled:opacity-50 transition-colors"
                                >
                                    {provisioning ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Provisioning...
                                        </>
                                    ) : (
                                        <>
                                            <LinkIcon className="w-4 h-4" />
                                            Provision Chain
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-protex-surface border border-white/10 p-6">
                        <h3 className="font-bold text-white mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-protex-muted">Registered Agents</span>
                                <span className="font-mono text-xl text-white">{agents.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-protex-muted">Highest Tier</span>
                                <span className={`font-mono ${agents.length > 0 ? tierColors[agents.reduce((best, a) => {
                                    const order = ['UNVERIFIED', 'VERIFIED', 'GOLD', 'PLATINUM'];
                                    return order.indexOf(a.tier) > order.indexOf(best.tier) ? a : best;
                                }).tier] : 'text-gray-500'}`}>
                                    {agents.length > 0 ? agents.reduce((best, a) => {
                                        const order = ['UNVERIFIED', 'VERIFIED', 'GOLD', 'PLATINUM'];
                                        return order.indexOf(a.tier) > order.indexOf(best.tier) ? a : best;
                                    }).tier : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Agent List */}
                <div className="lg:col-span-2">
                    <div className="bg-protex-surface border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Your Agents</h3>
                            <Link to="/agents" className="text-protex-accent hover:underline text-sm font-mono">
                                Browse All →
                            </Link>
                        </div>

                        {loadingAgents ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 text-protex-primary animate-spin" />
                            </div>
                        ) : agents.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="w-12 h-12 text-protex-muted mx-auto mb-4" />
                                <h4 className="text-lg font-bold text-white mb-2">No Agents Yet</h4>
                                <p className="text-protex-muted mb-6">
                                    Register your first AI agent to get started.
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 border border-protex-accent text-protex-accent px-4 py-2 hover:bg-protex-accent/10 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Register Agent
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {agents.map(agent => (
                                    <Link
                                        key={agent.id}
                                        to={`/agent/${agent.id}`}
                                        className="flex items-center justify-between p-4 bg-black/30 border border-white/5 hover:border-protex-primary/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <AgentGauge score={agent.reputation_score} size={50} />
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-protex-accent transition-colors">
                                                    {agent.name}
                                                </h4>
                                                <p className="mono-label text-xs">
                                                    {agent.tier} • v{agent.version}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-protex-muted group-hover:text-protex-accent transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
