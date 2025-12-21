import { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Terminal, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, loading, login, logout } = useAuth();

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setIsScrolled(latest > 50);
        });
    }, [scrollY]);

    return (
        <motion.nav
            className={`fixed w-full z-50 transition-all duration-300 border-b ${isScrolled
                ? 'bg-protex-bg/80 backdrop-blur-md border-white/10 py-3'
                : 'bg-transparent border-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-protex-primary flex items-center justify-center rounded-sm text-white group-hover:bg-protex-accent transition-colors">
                        <Terminal className="w-5 h-5" />
                    </div>
                    <span className="font-mono font-bold text-white tracking-widest text-lg uppercase hidden md:block">
                        Registr<span className="text-protex-primary">AI</span>
                    </span>
                </Link>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex gap-6 items-center">
                        <Link to="/docs" className="mono-label text-[11px] hover:text-protex-accent transition-colors">DOCS</Link>
                        {['Features', 'Directory'].map((item) => (
                            <a key={item} href="#" className="mono-label text-[11px] hover:text-protex-accent transition-colors">
                                {item.toUpperCase()}
                            </a>
                        ))}
                    </div>

                    {loading ? (
                        <div className="w-8 h-8 border-2 border-white/20 border-t-protex-primary rounded-full animate-spin" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                {user.picture ? (
                                    <img src={user.picture} alt={user.name || ''} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <User className="w-5 h-5 text-protex-muted" />
                                )}
                                <span className="hidden md:block text-sm text-white">{user.name?.split(' ')[0]}</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="text-protex-muted hover:text-white transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={login}
                            className="flex items-center gap-2 border border-white/20 hover:bg-white/5 hover:border-protex-accent hover:text-protex-accent px-5 py-2 text-xs font-mono uppercase transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};
