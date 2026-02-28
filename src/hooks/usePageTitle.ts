import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllRoutes } from '@/config/routes';

const APP_NAME = 'Lavandería del 13';

/**
 * Hook that automatically sets document.title based on the current route.
 * Falls back to just the app name if no matching route is found.
 */
export function usePageTitle() {
    const location = useLocation();

    useEffect(() => {
        const allRoutes = getAllRoutes();
        const currentRoute = allRoutes.find(route => route.path === location.pathname);

        if (currentRoute?.title) {
            document.title = `${currentRoute.title} | ${APP_NAME}`;
        } else {
            document.title = APP_NAME;
        }
    }, [location.pathname]);
}
