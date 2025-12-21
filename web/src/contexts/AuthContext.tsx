import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: number;
    email: string;
    name: string | null;
    picture: string | null;
    chainId: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
    provisionChain: () => Promise<string | null>;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${API_URL}/api/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const logout = () => {
        window.location.href = `${API_URL}/auth/logout`;
    };

    const provisionChain = async (): Promise<string | null> => {
        try {
            const res = await fetch(`${API_URL}/api/provision-chain`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                await fetchUser(); // Refresh user data
                return data.chainId;
            }
            return null;
        } catch {
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            provisionChain,
            refetchUser: fetchUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
