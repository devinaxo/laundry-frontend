import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import BaseLayout from './BaseLayout';

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
    return (
        <ProtectedRoute>
            <BaseLayout>
                {children}
            </BaseLayout>
        </ProtectedRoute>
    );
};

export default ProtectedLayout;