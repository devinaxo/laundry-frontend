import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Order } from '@/types/api';
import { Calendar, FileText, Package, User, Phone, MapPin, Edit3 } from 'lucide-react';
import { statusColors, statusLabels } from './statuses';
import { updateOrderStatus } from '@/api/patchFetches';
import { toast } from 'sonner';
import { useState } from 'react';

interface OrderDetailsModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    showStatusEdit?: boolean;
    onStatusUpdate?: (updatedOrder: Order) => void;
}

export default function OrderDetailsModal({
    order,
    isOpen,
    onClose,
    showStatusEdit = false,
    onStatusUpdate
}: OrderDetailsModalProps) {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    if (!order) return null;

    const handleStatusChange = async (newStatus: string) => {
        if (!order || newStatus === order.status) return;

        const validStatuses = ['pending', 'in_progress', 'ready', 'delivered', 'cancelled'] as const;
        type OrderStatus = typeof validStatuses[number];

        if (!validStatuses.includes(newStatus as OrderStatus)) {
            toast.error('Estado de pedido inválido');
            return;
        }

        try {
            setIsUpdatingStatus(true);
            const response = await updateOrderStatus(order.id, newStatus as OrderStatus);

            if (response.success) {
                toast.success('Estado del pedido actualizado exitosamente');
                onStatusUpdate?.(response.data);
            } else {
                toast.error('Error al actualizar el estado del pedido');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error al actualizar el estado del pedido');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = parseFloat(order.total);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between pr-4">
                        <span>Detalles del Pedido #{order.order_number}</span>
                        {showStatusEdit ? (
                            <div className="flex items-center gap-3">
                                <Select
                                    value={order.status}
                                    onValueChange={handleStatusChange}
                                    disabled={isUpdatingStatus}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                                Pendiente
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                En Proceso
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="ready">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                Listo
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="delivered">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                Entregado
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                Cancelado
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Edit3 className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ) : (
                            <Badge className={statusColors[order.status]}>
                                {statusLabels[order.status]}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6">
                        {/* Client Information */}
                        <div className="space-y-3">
                            <h3 className="text-lg text-foreground font-semibold flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Cliente
                            </h3>
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-foreground">
                                        {order.client.forename} {order.client.surname}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={`https://wa.me/${order.client.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-all duration-200 ease-in-out"
                                        >
                                            <Phone className="h-4 w-4" />
                                            {order.client.phone}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <a
                                        href={`https://www.google.com/maps?q=${order.client.latitude},${order.client.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                                        title="Ver ubicación en Google Maps"
                                    >
                                        {order.client.address}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Order Information */}
                        <div className="space-y-3">
                            <h3 className="text-lg text-foreground font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Información del Pedido
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        <Calendar className="h-4 w-4" />
                                        Fecha de Recepción
                                    </div>
                                    <div className="font-medium text-foreground">
                                        {new Date(order.reception_date).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        <Calendar className="h-4 w-4" />
                                        Fecha de Entrega
                                    </div>
                                    <div className="font-medium text-foreground">
                                        {order.actual_delivery_date ?
                                            new Date(order.actual_delivery_date).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            }) : '-'
                                        }
                                    </div>
                                </div>
                            </div>

                            {order.notes && (
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <div className="text-sm text-muted-foreground mb-2">Notas</div>
                                    <div className="text-sm text-foreground">{order.notes}</div>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            <h3 className="text-lg text-foreground font-semibold flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Artículos ({totalItems} artículo{totalItems !== 1 ? 's' : ''})
                            </h3>
                            <div className="space-y-3">
                                {order.items.map((item, index) => (
                                    <div key={item.id || index} className="border border-border rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium mb-1 text-foreground">
                                                    {item.subcategory?.category?.name} - {item.subcategory?.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground mb-2">
                                                    Cantidad: {item.quantity} • Precio unitario: ${parseFloat(item.unit_price || '0').toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </div>
                                                {item.notes && (
                                                    <div className="text-sm text-muted-foreground bg-muted/30 rounded p-2 mt-2">
                                                        <strong>Notas:</strong> {item.notes}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-foreground">
                                                    ${parseFloat(item.subtotal || '0').toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <Separator />
                        <div className="flex justify-end">
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">Total del Pedido</div>
                                <div className="text-2xl font-bold text-foreground">
                                    ${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}