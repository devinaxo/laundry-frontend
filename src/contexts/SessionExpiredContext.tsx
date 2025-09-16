import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SessionExpiredContextType {
    isSessionExpired: boolean;
    showSessionExpiredModal: () => void;
    hideSessionExpiredModal: () => void;
}

const SessionExpiredContext = createContext<SessionExpiredContextType | undefined>(undefined);

export const useSessionExpired = () => {
    const context = useContext(SessionExpiredContext);
    if (context === undefined) {
        throw new Error('useSessionExpired must be used within a SessionExpiredProvider');
    }
    return context;
};

interface SessionExpiredProviderProps {
    children: ReactNode;
}

export const SessionExpiredProvider: React.FC<SessionExpiredProviderProps> = ({ children }) => {
    const [isSessionExpired, setIsSessionExpired] = useState(false);

    const showSessionExpiredModal = () => {
        setIsSessionExpired(true);
    };

    const hideSessionExpiredModal = () => {
        setIsSessionExpired(false);
    };

    const value = {
        isSessionExpired,
        showSessionExpiredModal,
        hideSessionExpiredModal,
    };

    return (
        <SessionExpiredContext.Provider value={value}>
            {children}
        </SessionExpiredContext.Provider>
    );
};