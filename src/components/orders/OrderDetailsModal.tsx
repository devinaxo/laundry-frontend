import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types/api';
import { Calendar, FileText, Package, User, Phone, MapPin, Edit3, Banknote, Download, Eye } from 'lucide-react';
import { statusColors, statusLabels } from './statuses';
import { updateOrderStatus } from '@/api/patchFetches';
import { getPaymentProof } from '@/api/getFetches';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import WhatsAppNotificationModal from './WhatsAppNotificationModal';
import PaymentInfoModal from './PaymentInfoModal';

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
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappClient, setWhatsappClient] = useState<{ name: string; phone: string } | null>(null);
  const [paymentInfoModalOpen, setPaymentInfoModalOpen] = useState(false);
  const [pendingDeliveredOrderId, setPendingDeliveredOrderId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  if (!currentOrder) return null;

  const handleDownloadPaymentProof = async () => {
    if (!currentOrder) return;

    try {
      const blob = await getPaymentProof(currentOrder.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-pedido-${currentOrder.order_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Comprobante descargado correctamente');
    } catch (error) {
      console.error('Error downloading payment proof:', error);
      toast.error('Error al descargar el comprobante');
    }
  };

  const handleViewPaymentProof = async () => {
    if (!currentOrder) return;

    try {
      const blob = await getPaymentProof(currentOrder.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing payment proof:', error);
      toast.error('Error al visualizar el comprobante');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!currentOrder || newStatus === currentOrder.status) return;

    const validStatuses = ['pending', 'in_progress', 'ready', 'delivered', 'cancelled'] as const;
    type OrderStatus = typeof validStatuses[number];

    if (!validStatuses.includes(newStatus as OrderStatus)) {
      toast.error('Estado de pedido inválido');
      return;
    }

    // If changing to delivered, show payment info modal
    if (newStatus === 'delivered') {
      setPendingDeliveredOrderId(currentOrder.id);
      setPaymentInfoModalOpen(true);
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const response = await updateOrderStatus(currentOrder.id, newStatus as OrderStatus);

      if (response.success) {
        toast.success('Estado del pedido actualizado exitosamente');
        // Use the full server response so that fields like payment_type,
        // payment_proof_path, and actual_delivery_date are correctly cleared
        // or updated (e.g. reverting from delivered back to another status).
        setCurrentOrder(prev => prev ? {
          ...prev,
          ...response.data,
          items: response.data.items ?? prev.items,
          client: response.data.client ?? prev.client,
        } : null);
        onStatusUpdate?.(response.data);

        if (newStatus === 'ready') {
          setWhatsappClient({
            name: `${currentOrder.client.forename} ${currentOrder.client.surname}`,
            phone: currentOrder.client.phone
          });
          setWhatsappModalOpen(true);
        }
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

  const handlePaymentInfoSuccess = async (paymentType: 'cash' | 'transfer') => {
    if (!pendingDeliveredOrderId || !currentOrder) return;

    try {
      setIsUpdatingStatus(true);
      const response = await updateOrderStatus(pendingDeliveredOrderId, 'delivered');

      if (response.success) {
        toast.success('Pedido marcado como entregado');
        // Merge the full server response with the payment info the user just entered,
        // so the details modal shows accurate data without needing to close and reopen.
        // For transfer payments, the proof was already uploaded before this call, so
        // we use a fallback truthy value if the status-update response doesn't include
        // the path yet (slight backend race condition).
        const proofPath = response.data.payment_proof_path
          ?? (paymentType === 'transfer' ? 'uploaded' : undefined);
        setCurrentOrder(prev => prev ? {
          ...prev,
          ...response.data,
          // The status-update endpoint may not return items/client — keep them from prev.
          items: response.data.items ?? prev.items,
          client: response.data.client ?? prev.client,
          payment_type: response.data.payment_type ?? paymentType,
          payment_proof_path: proofPath ?? prev.payment_proof_path,
        } : null);
        onStatusUpdate?.(response.data);
      } else {
        toast.error('Error al actualizar el estado del pedido');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar el estado del pedido');
    } finally {
      setIsUpdatingStatus(false);
      setPendingDeliveredOrderId(null);
    }
  };

  const totalItems = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = parseFloat(currentOrder.total);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-4">
            <span>Detalles del Pedido #{currentOrder.order_number}</span>
            {showStatusEdit ? (
              <div className="flex items-center gap-3">
                <Select
                  value={currentOrder.status}
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
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
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
              <Badge className={statusColors[currentOrder.status]}>
                {statusLabels[currentOrder.status]}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Client Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </h3>
              <div className="border border-border rounded-lg p-4 bg-card space-y-3">
                <div className="pb-2 border-b border-border">
                  <p className="font-semibold text-foreground text-base">
                    {currentOrder.client.forename} {currentOrder.client.surname}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${currentOrder.client.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors group cursor-pointer"
                >
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="font-medium text-green-600 dark:text-green-400 group-hover:underline">
                      {currentOrder.client.phone}
                    </p>
                  </div>
                </a>
                <a
                  href={`https://www.google.com/maps?q=${currentOrder.client.latitude},${currentOrder.client.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors group cursor-pointer"
                  title="Ver ubicación en Google Maps"
                >
                  <MapPin className="h-4 w-4 text-primary dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="text-sm text-primary dark:text-blue-400 group-hover:underline">
                      {currentOrder.client.address}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detalles del Pedido
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recepción</span>
                  </div>
                  <div className="font-semibold text-foreground text-base">
                    {new Date(currentOrder.reception_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(currentOrder.reception_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                    })}
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Entrega</span>
                  </div>
                  <div className="font-semibold text-foreground text-base">
                    {currentOrder.actual_delivery_date ?
                      new Date(currentOrder.actual_delivery_date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : <span className="text-muted-foreground">Pendiente</span>
                    }
                  </div>
                  {currentOrder.actual_delivery_date && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(currentOrder.actual_delivery_date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                      })}
                    </div>
                  )}
                </div>
              </div>

              {currentOrder.notes && (
                <div className="border border-border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1 uppercase tracking-wide">Notas</p>
                      <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{currentOrder.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            {currentOrder.status === 'delivered' && currentOrder.payment_type && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Información de Pago
                </h3>
                <div className="border border-border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                        <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo de Pago</p>
                        <p className="font-semibold text-foreground">
                          {currentOrder.payment_type === 'cash' ? 'Efectivo' : 'Transferencia'}
                        </p>
                      </div>
                    </div>
                    {currentOrder.payment_type === 'transfer' && currentOrder.payment_proof_path && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewPaymentProof}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Comprobante
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadPaymentProof}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Descargar
                        </Button>
                      </div>
                    )}
                  </div>
                  {currentOrder.payment_type === 'transfer' && !currentOrder.payment_proof_path && (
                    <div className="mt-3 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                      ⚠️ No se ha cargado un comprobante de pago
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="space-y-3">
              <h3 className="text-lg text-foreground font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Artículos ({totalItems} artículo{totalItems !== 1 ? 's' : ''})
              </h3>
              <div className="space-y-3">
                {currentOrder.items.map((item, index) => (
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

      <WhatsAppNotificationModal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        clientName={whatsappClient?.name || ''}
        clientPhone={whatsappClient?.phone || ''}
      />

      {pendingDeliveredOrderId && (
        <PaymentInfoModal
          isOpen={paymentInfoModalOpen}
          onClose={() => {
            setPaymentInfoModalOpen(false);
            setPendingDeliveredOrderId(null);
          }}
          orderId={pendingDeliveredOrderId}
          orderNumber={currentOrder?.order_number || ''}
          onSuccess={(pt) => handlePaymentInfoSuccess(pt)}
        />
      )}
    </Dialog>
  );
}