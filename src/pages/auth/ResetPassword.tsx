import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { resetPassword } from '@/api/postFetches';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (!tokenParam || !emailParam) {
            setError('El enlace de recuperación es inválido o ha expirado. Por favor, solicite un nuevo enlace.');
        } else {
            setToken(tokenParam);
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!password || !passwordConfirmation) {
            setError('Por favor, complete todos los campos');
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (!token || !email) {
            setError('El enlace de recuperación es inválido. Por favor, solicite un nuevo enlace.');
            return;
        }

        setIsLoading(true);

        try {
            await resetPassword(token, email, password, passwordConfirmation);
            setSuccess(true);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                if (error.response?.data?.message) {
                    setError(error.response.data.message);
                } else {
                    setError('No se pudo restablecer la contraseña. Por favor, inténtelo de nuevo más tarde.');
                }
            } else {
                setError('No se pudo restablecer la contraseña. Por favor, inténtelo de nuevo más tarde.');
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
                        Restablecer Contraseña
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Ingrese su nueva contraseña
                    </p>
                </div>

                {success ? (
                    <div className="space-y-4 !mt-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                <CheckCircle className="w-5 h-5" />
                                <p className="text-sm font-medium">
                                    ¡Su contraseña ha sido restablecida exitosamente!
                                </p>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                Presione el botón de abajo para iniciar sesión con su nueva contraseña.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <Link to="/login">
                                <Button className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Ir al inicio de sesión
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="password">Nueva Contraseña</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingrese su nueva contraseña"
                                    disabled={isLoading || !token || !email}
                                />
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Confirme su nueva contraseña"
                                    disabled={isLoading || !token || !email}
                                />
                            </div>
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
                                disabled={isLoading || !token || !email}
                            >
                                {isLoading ? (
                                    <div className='flex items-center gap-2'>
                                        Restableciendo
                                        <Spinner variant='ellipsis' />
                                    </div>
                                ) : 'Restablecer contraseña'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
