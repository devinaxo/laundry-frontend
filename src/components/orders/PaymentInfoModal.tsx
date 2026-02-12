import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { toast } from 'sonner';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadPaymentProof } from '@/api/postFetches';
import { updateOrder } from '@/api/patchFetches';

interface PaymentInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    orderNumber: string;
    onSuccess?: () => void;
}

export default function PaymentInfoModal({ isOpen, onClose, orderId, orderNumber, onSuccess }: PaymentInfoModalProps) {
    const [paymentType, setPaymentType] = useState<'cash' | 'transfer' | ''>('');
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!paymentType) {
            toast.error('Debe seleccionar un tipo de pago');
            return;
        }

        if (paymentType === 'transfer' && !paymentProofFile) {
            toast.error('Debe agregar el comprobante de pago para transferencias');
            return;
        }

        setIsSubmitting(true);
        try {
            if (paymentType === 'transfer') {
                if (paymentProofFile) {
                    await uploadPaymentProof(orderId, paymentProofFile, 'transfer');
                }
            } else {
                await updateOrder(orderId, { payment_type: 'cash' });
            }

            toast.success('Información de pago guardada correctamente');
            onSuccess?.();
            onClose();
            
            setPaymentType('');
            setPaymentProofFile(null);
        } catch (error) {
            console.error('Error saving payment info:', error);
            toast.error('Error al guardar la información de pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setPaymentType('');
            setPaymentProofFile(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Información de Pago - Pedido #{orderNumber}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="payment_type">
                            Tipo de Pago <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={paymentType}
                            onValueChange={(value) => setPaymentType(value as 'cash' | 'transfer')}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo de pago" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Efectivo</SelectItem>
                                <SelectItem value="transfer">Transferencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {paymentType === 'transfer' && (
                        <div className="space-y-2">
                            <Label htmlFor="payment_proof">
                                Comprobante de Pago <span className="text-red-500">*</span>
                            </Label>
                            <div className="space-y-3">
                                <Input
                                    type="file"
                                    id="payment_proof"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                                    disabled={isSubmitting}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="payment_proof"
                                    className={cn(
                                        "flex items-center justify-center gap-3 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                        isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-accent/50",
                                        paymentProofFile ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-muted-foreground/25"
                                    )}
                                >
                                    {paymentProofFile ? (
                                        <>
                                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                                    Archivo seleccionado
                                                </p>
                                                <p className="text-xs text-green-600 dark:text-green-400 truncate">
                                                    {paymentProofFile.name}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPaymentProofFile(null);
                                                }}
                                                disabled={isSubmitting}
                                                className="h-8 w-8 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                            <div className="flex-1 text-center">
                                                <p className="text-sm font-medium text-foreground">
                                                    Haz clic para seleccionar un archivo
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Formatos: Imágenes (JPG, PNG) o PDF
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner variant="circle" className="mr-2 h-4 w-4" />}
                            Guardar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
