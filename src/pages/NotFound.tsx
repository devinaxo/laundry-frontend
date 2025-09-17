import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6 p-8">
                <div className="space-y-2">
                    <h1 className="text-9xl font-bold text-primary/20">404</h1>
                    <h2 className="text-3xl font-semibold text-foreground">
                        Página no encontrada
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Lo sentimos, la página que estás buscando no existe o ha sido movida.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                    <Button 
                        onClick={handleGoBack}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver atrás
                    </Button>
                    <Button 
                        onClick={handleGoHome}
                        className="flex items-center gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Ir al inicio
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;