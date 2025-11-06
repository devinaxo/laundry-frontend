import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { forgotPassword } from '@/api/postFetches';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email) {
            setError('Por favor, ingrese su correo electrónico');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, ingrese un correo electrónico válido');
            return;
        }

        setIsLoading(true);

        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                if (error.response?.data?.message) {
                    setError(error.response.data.message);
                } else {
                    setError('No se pudo procesar la solicitud. Por favor, inténtelo de nuevo más tarde.');
                }
            } else {
                setError('No se pudo procesar la solicitud. Por favor, inténtelo de nuevo más tarde.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Recuperar Contraseña
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Ingrese su correo electrónico para recibir un enlace de recuperación
                    </p>
                </div>

                {success ? (
                    <div className="space-y-4 !mt-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                            <p className="text-sm text-green-800 dark:text-green-200">
                                Se ha enviado un correo electrónico con instrucciones para restablecer su contraseña.
                                Por favor, revise su bandeja de entrada y carpeta de spam.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <Link to="/login">
                                <Button variant="outline" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver al inicio de sesión
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="text-destructive text-sm text-center">{error}</div>
                        )}

                        <div className="flex gap-3">
                            <Link to="/login" className="block">
                                <Button variant="outline" className="w-full gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver al inicio de sesión
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className='flex items-center gap-2'>
                                        Enviando
                                        <Spinner variant='ellipsis' />
                                    </div>
                                ) : 'Recupera mi contraseña'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
