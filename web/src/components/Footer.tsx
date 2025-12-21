export const Footer = () => {
    return (
        <footer className="py-20 border-t border-white/10 bg-protex-surface">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-2">
                    <h4 className="text-2xl font-bold text-white mb-6">RegistrAI</h4>
                    <p className="body-text max-w-sm text-protex-muted">
                        The security layer for the agent economy.
                        Open source, decentralized, and verifiable.
                    </p>
                </div>
                <div>
                    <h5 className="mono-label mb-6 text-white">Platform</h5>
                    <ul className="space-y-4 body-text text-sm text-protex-muted">
                        <li><a href="#" className="hover:text-protex-accent transition-colors">Directory</a></li>
                        <li><a href="#" className="hover:text-protex-accent transition-colors">Oracle Bridge</a></li>
                        <li><a href="/docs" className="hover:text-protex-accent transition-colors">Documentation</a></li>
                    </ul>
                </div>
                <div>
                    <h5 className="mono-label mb-6 text-white">Social</h5>
                    <ul className="space-y-4 body-text text-sm text-protex-muted">
                        <li><a href="#" className="hover:text-protex-accent transition-colors">Twitter / X</a></li>
                        <li><a href="#" className="hover:text-protex-accent transition-colors">GitHub</a></li>
                        <li><a href="#" className="hover:text-protex-accent transition-colors">Discord</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};
