import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateOrder } from '@/api/patchFetches';
import type { Order } from '@/types/api';
import { toast } from 'sonner';

interface EditOrderModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onOrderUpdated: () => void;
}

export default function EditOrderModal({ order, isOpen, onClose, onOrderUpdated }: EditOrderModalProps) {
    const [formData, setFormData] = useState({
        status: '',
        actual_delivery_date: '',
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    // Helper function to convert ISO date string to YYYY-MM-DD format
    const formatDateForInput = (isoString: string | null | undefined): string => {
        if (!isoString) return '';
        try {
            // Parse the ISO string and format as YYYY-MM-DD
            const date = new Date(isoString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error parsing date:', error);
            return '';
        }
    };

    useEffect(() => {
        if (order && isOpen) {
            console.log(order)
            setFormData({
                status: order.status || '',
                actual_delivery_date: formatDateForInput(order.actual_delivery_date),
                notes: order.notes || '',
            });
        }
    }, [order, isOpen]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;

        setIsLoading(true);
        try {
            await updateOrder(order.id, {
                status: formData.status as 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled',
                actual_delivery_date: formData.actual_delivery_date || undefined,
                notes: formData.notes || undefined,
            });

            toast.success('Pedido actualizado exitosamente');
            onOrderUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Error al actualizar el pedido');
        } finally {
            setIsLoading(false);
        }
    };

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Pedido #{order.order_number}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="in_progress">En Proceso</SelectItem>
                                <SelectItem value="ready">Listo</SelectItem>
                                <SelectItem value="delivered">Entregado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.status === 'delivered' && (
                        <div className="space-y-2">
                            <Label htmlFor="actual_delivery_date">Fecha Real de Entrega</Label>
                            <Input
                                type="date"
                                id="actual_delivery_date"
                                value={formData.actual_delivery_date}
                                onChange={(e) => setFormData({ ...formData, actual_delivery_date: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Notas adicionales..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}