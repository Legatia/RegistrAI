import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, FileCode, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createAgent, hashFile } from '../utils/api';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [file, setFile] = useState<File | null>(null);
    const [codeHash, setCodeHash] = useState<string>('');
    const [agentName, setAgentName] = useState('');
    const [description, setDescription] = useState('');
    const [capabilities, setCapabilities] = useState('');
    const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setUploading(true);
            setError(null);
            try {
                const hash = await hashFile(selectedFile);
                setFile(selectedFile);
                setCodeHash(hash);
            } catch (err) {
                setError('Failed to process file');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            login();
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const capsArray = capabilities
                .split(',')
                .map(c => c.trim())
                .filter(c => c.length > 0);

            const agent = await createAgent({
                name: agentName,
                description,
                code_hash: codeHash,
                capabilities: capsArray,
                storage_provider: 'IPFS',
                storage_cid: '', // Would upload to IPFS in production
            });

            setCreatedAgentId(agent.id);
            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to register agent');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto pt-32 px-6 pb-20 max-w-3xl">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Register New Agent</h1>
                <p className="text-protex-muted">Deploy your autonomous agent to the RegistrAI network.</p>
            </div>

            {/* Auth Warning */}
            {!user && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 mb-8 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-300">
                        You need to <button onClick={login} className="underline hover:text-yellow-100">sign in</button> to register agents.
                    </span>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/30 p-4 mb-8 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">{error}</span>
                </div>
            )}

            {/* Stepper */}
            <div className="flex items-center justify-between mb-12 px-12 relative">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -z-10" />

                {[1, 2, 3].map((s) => (
                    <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm border-2 transition-colors ${step >= s
                        ? 'bg-protex-primary border-protex-primary text-white'
                        : 'bg-protex-bg border-white/20 text-protex-muted'
                        }`}>
                        {s}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="bg-protex-surface border border-white/10 p-8 min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">Upload Agent Code</h2>
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center hover:border-protex-primary/50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                                accept=".zip,.tar.gz,.wasm"
                            />
                            {uploading ? (
                                <Loader2 className="w-12 h-12 text-protex-primary mx-auto mb-4 animate-spin" />
                            ) : file ? (
                                <FileCode className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            ) : (
                                <Upload className="w-12 h-12 text-protex-muted mx-auto mb-4" />
                            )}

                            <p className="text-white font-medium mb-1">
                                {file ? file.name : "Drag and drop your agent bundle"}
                            </p>
                            <p className="text-sm text-protex-muted">
                                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supports .wasm, .zip, .tar.gz (Max 50MB)"}
                            </p>
                        </div>

                        {codeHash && (
                            <div className="bg-black/30 p-4 border border-white/5">
                                <div className="mono-label mb-2">Code Hash (SHA-256)</div>
                                <code className="text-xs text-protex-accent break-all">{codeHash}</code>
                            </div>
                        )}

                        <div className="flex justify-end mt-8">
                            <button
                                disabled={!file}
                                onClick={() => setStep(2)}
                                className="bg-white text-black px-6 py-3 font-mono font-bold uppercase hover:bg-protex-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">Agent Metadata</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mono-label block mb-2">Agent Name *</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-protex-primary focus:outline-none"
                                    placeholder="e.g. TradingBot-V1"
                                    value={agentName}
                                    onChange={e => setAgentName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mono-label block mb-2">Description</label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-protex-primary focus:outline-none resize-none"
                                    placeholder="What does your agent do?"
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mono-label block mb-2">Capabilities (Comma Separated)</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-protex-primary focus:outline-none"
                                    placeholder="DeFi, NFT, Social"
                                    value={capabilities}
                                    onChange={e => setCapabilities(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mono-label block mb-2">Initial Version</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-protex-primary focus:outline-none"
                                    defaultValue="v1.0.0"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="text-protex-muted hover:text-white px-6 py-3 font-mono uppercase"
                            >
                                Back
                            </button>
                            <button
                                disabled={!agentName || submitting}
                                onClick={handleSubmit}
                                className="flex items-center gap-2 bg-protex-primary text-white px-8 py-3 font-mono font-bold uppercase hover:bg-protex-primary/80 disabled:opacity-50 transition-colors"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {submitting ? 'Registering...' : 'Register Agent'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Registration Complete</h2>
                        <p className="text-protex-muted max-w-md mx-auto mb-8">
                            Your agent <strong className="text-white">{agentName}</strong> has been successfully registered on the RegistrAI network. Evaluation period will begin shortly.
                        </p>

                        <div className="flex justify-center gap-4">
                            <Link to="/dashboard">
                                <button className="border border-white/20 px-6 py-3 text-white hover:bg-white/5 uppercase font-mono text-sm">
                                    Go to Dashboard
                                </button>
                            </Link>
                            <button
                                onClick={() => navigate(`/agent/${createdAgentId}`)}
                                className="bg-white text-black px-6 py-3 uppercase font-mono font-bold text-sm hover:bg-protex-accent"
                            >
                                View Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
