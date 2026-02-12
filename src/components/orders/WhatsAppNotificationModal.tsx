import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, User, Phone } from 'lucide-react';

interface WhatsAppNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string;
    clientPhone: string;
}

export default function WhatsAppNotificationModal({
    isOpen,
    onClose,
    clientName,
    clientPhone
}: WhatsAppNotificationModalProps) {
    const handleSendWhatsApp = () => {
        const message = encodeURIComponent(
            `Hola ${clientName}, su(s) artículo(s) de lavandería ya está(n) listo(s) para retirar, o podemos pasar a dejarlo(s) a su domicilio. Saludos`
        );
        const cleanedNumber = clientPhone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanedNumber}?text=${message}`, '_blank');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        Notificar al Cliente
                    </DialogTitle>
                    <DialogDescription>
                        ¿Quieres avisarle al cliente por WhatsApp que su pedido está listo?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4 bg-card">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            Información del Cliente
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium text-foreground">{clientName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{clientPhone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                        <div className="flex items-start gap-2 mb-3">
                            <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs font-medium text-green-900 dark:text-green-200 uppercase tracking-wide">
                                Mensaje a Enviar
                            </p>
                        </div>
                        <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed">
                            "Hola {clientName}, su(s) artículo(s) de lavandería ya está(n) listo(s) para retirar, o podemos pasar a dejarlo(s) a su domicilio. Saludos"
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSendWhatsApp}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Enviar WhatsApp
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
