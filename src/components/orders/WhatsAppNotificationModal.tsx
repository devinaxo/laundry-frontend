import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

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
            `Hola ${clientName}, su artículo de lavandería ya está listo para retirar, o podemos pasar a dejarlo a su domicilio. Saludos`
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
                    <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">Cliente:</p>
                        <p className="font-medium text-foreground">{clientName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{clientPhone}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">Mensaje:</p>
                        <p className="text-sm text-foreground italic">
                            "Hola {clientName}, su artículo de lavandería ya está listo para retirar, o podemos pasar a dejarlo a su domicilio. Saludos"
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
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
