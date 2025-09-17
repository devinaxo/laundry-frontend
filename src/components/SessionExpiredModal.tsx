import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSessionExpired } from '@/contexts/SessionExpiredContext';
import { AlertTriangle } from 'lucide-react';

export const SessionExpiredModal: React.FC = () => {
    const navigate = useNavigate();
    const { isSessionExpired, hideSessionExpiredModal } = useSessionExpired();

    const handleRedirectToLogin = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        hideSessionExpiredModal();

        navigate('/login', { replace: true });
    };

    return (
        <Dialog open={isSessionExpired} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md [&>button]:hidden">
                <DialogHeader>
                    <div className="flex items-center">
                        <div>
                            <DialogTitle className="flex items-center justify-between space-x-3">
                                Sesión Expirada
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                    <AlertTriangle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                                </div>
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                Tu sesión ha expirado por motivos de seguridad. Por favor, inicia sesión nuevamente para continuar.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <DialogFooter className="mt-6">
                    <Button onClick={handleRedirectToLogin} className="w-full">
                        Redireccioname
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};