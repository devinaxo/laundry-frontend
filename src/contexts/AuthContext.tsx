import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { postLogin, postLogout } from '@/api/postFetches';
import { setAuthToken, removeAuthToken } from '@/lib/axios';
import { toast } from 'sonner';
import type { User } from '@/types/api';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('auth_token');

        if (storedUser && storedToken) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setAuthToken(storedToken);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('auth_token');
                removeAuthToken();
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const response = await postLogin(username, password);

            const { token, user: userData } = response;

            setUser(userData);
            setAuthToken(token);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('auth_token', token);

            setIsLoading(false);
            toast.success("Sesión iniciada correctamente");
            return true;
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
            toast.error("Error al iniciar sesión");
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await postLogout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            setUser(null);
            removeAuthToken();
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
        }
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};