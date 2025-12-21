import { useState } from 'react';
import { Upload, FileCode, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RegisterPage = () => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [file, setFile] = useState<File | null>(null);
    const [agentName, setAgentName] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            setTimeout(() => {
                setFile(e.target.files![0]);
                setUploading(false);
            }, 1500); // Fake upload delay
        }
    };

    const handleSubmit = () => {
        setStep(3);
    };

    return (
        <div className="container mx-auto pt-32 px-6 pb-20 max-w-3xl">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Register New Agent</h1>
                <p className="text-protex-muted">Deploy your autonomous agent to the RegistrAI network.</p>
            </div>

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
                                <label className="mono-label block mb-2">Agent Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-protex-primary focus:outline-none"
                                    placeholder="e.g. TradingBot-V1"
                                    value={agentName}
                                    onChange={e => setAgentName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mono-label block mb-2">Capabilities (Comma Separated)</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-protex-primary focus:outline-none"
                                    placeholder="DeFi, NFT, Social"
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
                                disabled={!agentName}
                                onClick={handleSubmit}
                                className="bg-protex-primary text-white px-8 py-3 font-mono font-bold uppercase hover:bg-protex-primary/80 disabled:opacity-50 transition-colors"
                            >
                                Register Agent
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
                            Your agent <strong>{agentName}</strong> has been successfully registered on the Linera network. Evaluation period will begin shortly.
                        </p>

                        <div className="flex justify-center gap-4">
                            <Link to="/dashboard">
                                <button className="border border-white/20 px-6 py-3 text-white hover:bg-white/5 uppercase font-mono text-sm">
                                    Go to Dashboard
                                </button>
                            </Link>
                            <Link to="/agent/new-id-123">
                                <button className="bg-white text-black px-6 py-3 uppercase font-mono font-bold text-sm hover:bg-protex-accent">
                                    View Profile
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
