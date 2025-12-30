import { useState } from 'react';
import { Send, Check, AlertCircle } from 'lucide-react';

const AGENT_TYPES = [
    { id: 'trading', label: 'Trading / DeFi bots' },
    { id: 'support', label: 'Customer support agents' },
    { id: 'research', label: 'Data analysis / research' },
    { id: 'social', label: 'Social media agents' },
    { id: 'gaming', label: 'Gaming / entertainment' },
    { id: 'other', label: 'Other' },
];

const USE_CASES = [
    { id: 'personal', label: 'Personal' },
    { id: 'startup', label: 'Startup' },
    { id: 'enterprise', label: 'Enterprise' },
];

const CHAINS = [
    { id: 'linera', label: 'Linera' },
    { id: 'ethereum', label: 'Ethereum / L2s' },
    { id: 'solana', label: 'Solana' },
    { id: 'other', label: 'Other' },
];

interface WaitlistFormProps {
    onSuccess?: () => void;
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
    const [email, setEmail] = useState('');
    const [agentTypes, setAgentTypes] = useState<string[]>([]);
    const [useCase, setUseCase] = useState('personal');
    const [chains, setChains] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [position, setPosition] = useState<number | null>(null);

    const toggleAgentType = (id: string) => {
        setAgentTypes(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const toggleChain = (id: string) => {
        setChains(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    agent_types: agentTypes,
                    use_case: useCase,
                    chains,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to join waitlist');
            }

            setStatus('success');
            setPosition(data.position);
            onSuccess?.();
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message);
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-protex-accent flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                    YOU'RE IN
                </h3>
                <p className="text-protex-muted font-mono text-sm">
                    Position #{position} — We'll notify you at launch.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div>
                <label className="mono-label text-[11px] text-protex-muted mb-3 block">
                    EMAIL ADDRESS *
                </label>
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-protex-primary to-protex-accent opacity-0 group-focus-within:opacity-50 transition duration-300" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="relative w-full px-4 py-4 bg-protex-surface border border-white/10 text-white font-mono text-sm placeholder-protex-muted focus:border-protex-accent focus:outline-none transition-all uppercase"
                    />
                </div>
            </div>

            {/* Agent Types */}
            <div>
                <label className="mono-label text-[11px] text-protex-muted mb-3 block">
                    WHAT TYPE OF AGENTS ARE YOU BUILDING?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AGENT_TYPES.map(type => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => toggleAgentType(type.id)}
                            className={`px-3 py-3 text-xs font-mono uppercase tracking-wide text-left transition-all border ${agentTypes.includes(type.id)
                                    ? 'bg-protex-primary/20 border-protex-primary text-white'
                                    : 'bg-protex-surface border-white/10 text-protex-muted hover:border-white/30'
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Use Case */}
            <div>
                <label className="mono-label text-[11px] text-protex-muted mb-3 block">
                    BUILDING FOR?
                </label>
                <div className="flex gap-2">
                    {USE_CASES.map(uc => (
                        <button
                            key={uc.id}
                            type="button"
                            onClick={() => setUseCase(uc.id)}
                            className={`flex-1 px-4 py-3 text-xs font-mono uppercase tracking-wide transition-all border ${useCase === uc.id
                                    ? 'bg-protex-primary/20 border-protex-primary text-white'
                                    : 'bg-protex-surface border-white/10 text-protex-muted hover:border-white/30'
                                }`}
                        >
                            {uc.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chains */}
            <div>
                <label className="mono-label text-[11px] text-protex-muted mb-3 block">
                    TARGET BLOCKCHAINS
                </label>
                <div className="flex flex-wrap gap-2">
                    {CHAINS.map(chain => (
                        <button
                            key={chain.id}
                            type="button"
                            onClick={() => toggleChain(chain.id)}
                            className={`px-4 py-3 text-xs font-mono uppercase tracking-wide transition-all border ${chains.includes(chain.id)
                                    ? 'bg-protex-primary/20 border-protex-primary text-white'
                                    : 'bg-protex-surface border-white/10 text-protex-muted hover:border-white/30'
                                }`}
                        >
                            {chain.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                </div>
            )}

            {/* Submit */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-protex-primary to-protex-accent opacity-75 blur group-hover:opacity-100 transition duration-500" />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="relative w-full py-4 bg-white text-black font-mono font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-protex-accent"
                >
                    {status === 'loading' ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            JOINING...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            JOIN WAITLIST
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
