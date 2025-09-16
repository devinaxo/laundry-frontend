import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SessionExpiredProvider, useSessionExpired } from './contexts/SessionExpiredContext';
import { SessionExpiredModal } from './components/SessionExpiredModal';
import { setSessionExpiredCallback } from './lib/axios';
import ProtectedLayout from './layouts/ProtectedLayout';
import { getAllRoutes } from './config/routes';
import Login from './pages/auth/Login';
import { Spinner } from './components/ui/shadcn-io/spinner';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[80vh]">
        <Spinner className='w-[40vw] h-[40vh] text-foreground' variant='infinite' />
    </div>
);

const AppContent = () => {
    const { showSessionExpiredModal } = useSessionExpired();
    const allRoutes = getAllRoutes();

    useEffect(() => {
        setSessionExpiredCallback(showSessionExpiredModal);
    }, [showSessionExpiredModal]);

    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                {allRoutes
                    .filter(route => route.requiresAuth)
                    .map(route => {
                        const Component = route.component;
                        if (!Component) return null;

                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={
                                    <ProtectedLayout>
                                        <Component />
                                    </ProtectedLayout>
                                }
                            />
                        );
                    })
                }
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <SessionExpiredModal />
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <SessionExpiredProvider>
                <Router>
                    <Suspense fallback={<LoadingSpinner />}>
                        <AppContent />
                    </Suspense>
                </Router>
            </SessionExpiredProvider>
        </AuthProvider>
    );
}

export default App;
