import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedLayout from './layouts/ProtectedLayout';
import { getAllRoutes } from './config/routes';
import Login from './pages/auth/Login';

// Loading component for suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  const allRoutes = getAllRoutes();
  
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes with layout - generated from routes config */}
            {allRoutes
              .filter(route => route.requiresAuth)
              .map(route => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedLayout>
                      <route.component />
                    </ProtectedLayout>
                  }
                />
              ))
            }

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
