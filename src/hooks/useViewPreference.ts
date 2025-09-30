import { useState, useEffect } from 'react';

type ViewMode = 'table' | 'cards';

/**
 * Custom hook to manage and persist view preferences for different list components
 * @param key - Unique identifier for the view preference (e.g., 'clients', 'orders')
 * @param defaultView - Default view mode if no preference is stored
 * @returns [viewMode, setViewMode] - Current view mode and function to update it
 */
export function useViewPreference(key: string, defaultView: ViewMode = 'table') {
    const storageKey = `viewPreference_${key}`;
    
    const [viewMode, setViewModeState] = useState<ViewMode>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return (stored as ViewMode) || defaultView;
        } catch (error) {
            console.warn('Failed to read view preference from localStorage:', error);
            return defaultView;
        }
    });

    const setViewMode = (newViewMode: ViewMode) => {
        try {
            setViewModeState(newViewMode);
            localStorage.setItem(storageKey, newViewMode);
        } catch (error) {
            console.warn('Failed to save view preference to localStorage:', error);
            setViewModeState(newViewMode);
        }
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === storageKey && e.newValue) {
                setViewModeState(e.newValue as ViewMode);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [storageKey]);

    return [viewMode, setViewMode] as const;
}