import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/shadcn-io/spinner';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        window.location.href = '/';
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Por favor, complete todos los campos');
            return;
        }

        try {
            const success = await login(username, password);
            if (!success) {
                setError('Nombre de usuario o contraseña inválidos. Por favor, verifique sus credenciales.');
            }
        } catch {
            setError('No se pudo conectar al servidor. Por favor, inténtelo de nuevo más tarde.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Inicie sesión en su cuenta
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="username">Nombre de Usuario</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingrese su nombre de usuario"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingrese su contraseña"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-destructive text-sm text-center">{error}</div>
                    )}

                    <div className="flex items-center justify-end">
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                            ¿Olvidó su contraseña?
                        </Link>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ?
                                <div className='flex items-center gap-2'>
                                    Iniciando sesión
                                    <Spinner variant='ellipsis' />
                                </div>
                                : 'Iniciar sesión'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;