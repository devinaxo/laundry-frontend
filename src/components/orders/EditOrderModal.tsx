import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { replaceOrder } from '@/api/putFetches';
import { getSubcategoriesList, getClientsList } from '@/api/getFetches';
import type { Order, Subcategory, Client, ReplaceOrderRequest } from '@/types/api';
import { toast } from 'sonner';
import { Plus, Trash2, Calculator, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditOrderModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onOrderUpdated: () => void;
}

interface OrderItemFormData {
    subcategory_id: string;
    quantity: number;
    notes: string;
    subcategory?: Subcategory;
}

export default function EditOrderModal({ order, isOpen, onClose, onOrderUpdated }: EditOrderModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingSubcategories, setLoadingSubcategories] = useState(true);
    const [loadingClients, setLoadingClients] = useState(true);
    const [clientComboOpen, setClientComboOpen] = useState(false);
    const [subcategoryComboStates, setSubcategoryComboStates] = useState<Record<number, boolean>>({});

    const [formData, setFormData] = useState({
        client_id: '',
        reception_date: '',
        status: '',
        actual_delivery_date: '',
        notes: ''
    });

    const [orderItems, setOrderItems] = useState<OrderItemFormData[]>([
        { subcategory_id: '', quantity: 1, notes: '' }
    ]);

    const formatDateForInput = (isoString: string | null | undefined): string => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error parsing date:', error);
            return '';
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            const [subcategoriesData, clientsData] = await Promise.all([
                getSubcategoriesList(),
                getClientsList()
            ]);
            setSubcategories(subcategoriesData);
            setClients(clientsData);
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast.error('Error al cargar los datos iniciales');
        } finally {
            setLoadingSubcategories(false);
            setLoadingClients(false);
        }
    };

    useEffect(() => {
        if (order && isOpen) {
            setFormData({
                client_id: order.client_id.toString(),
                reception_date: formatDateForInput(order.reception_date),
                status: order.status || '',
                actual_delivery_date: formatDateForInput(order.actual_delivery_date),
                notes: order.notes || ''
            });

            setOrderItems(order.items.map(item => ({
                subcategory_id: item.subcategory_id.toString(),
                quantity: item.quantity,
                notes: item.notes || ''
            })));
        }
    }, [order, isOpen]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleItemChange = (index: number, field: keyof OrderItemFormData, value: string | number) => {
        setOrderItems(prev => prev.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value };

                if (field === 'subcategory_id') {
                    const subcategory = subcategories.find(sub => sub.id.toString() === value);
                    updatedItem.subcategory = subcategory;
                }

                return updatedItem;
            }
            return item;
        }));
    };

    const addOrderItem = () => {
        setOrderItems(prev => [...prev, { subcategory_id: '', quantity: 1, notes: '' }]);
    };

    const removeOrderItem = (index: number) => {
        if (orderItems.length > 1) {
            setOrderItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    const calculateTotal = (): number => {
        return orderItems.reduce((total, item) => {
            if (item.subcategory_id) {
                const subcategory = subcategories.find(sub => sub.id.toString() === item.subcategory_id);
                if (subcategory) {
                    return total + (parseFloat(subcategory.price) * item.quantity);
                }
            }
            return total;
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;

        if (!formData.client_id) {
            toast.error('El cliente es obligatorio');
            return;
        }

        if (!formData.reception_date) {
            toast.error('La fecha de recepción es obligatoria');
            return;
        }

        if (orderItems.length === 0) {
            toast.error('Debe agregar al menos un artículo al pedido');
            return;
        }

        const invalidItems = orderItems.filter(item => !item.subcategory_id || item.quantity < 1);
        if (invalidItems.length > 0) {
            toast.error('Todos los artículos deben tener un tipo válido y cantidad mayor a 0');
            return;
        }

        setIsLoading(true);
        try {
            const orderData: ReplaceOrderRequest = {
                client_id: parseInt(formData.client_id),
                reception_date: formData.reception_date,
                status: formData.status as 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled',
                actual_delivery_date: formData.status === 'delivered' && formData.actual_delivery_date ? formData.actual_delivery_date : undefined,
                notes: formData.notes.trim() || undefined,
                items: orderItems.map(item => ({
                    subcategory_id: parseInt(item.subcategory_id),
                    quantity: item.quantity,
                    notes: item.notes.trim() || undefined
                }))
            };

            await replaceOrder(order.id, orderData);
            
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

    const getClientDisplayName = (client: Client) => {
        return `${client.surname}, ${client.forename}`;
    };

    const getSubcategoryDisplayName = (subcategory: Subcategory) => {
        return `${subcategory.category.name} - ${subcategory.name} ($${parseFloat(subcategory.price).toFixed(2)})`;
    };

    const toggleSubcategoryCombo = (index: number, isOpen: boolean) => {
        setSubcategoryComboStates(prev => ({
            ...prev,
            [index]: isOpen
        }));
    };

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Pedido #{order.order_number}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="client">Cliente <span className="text-red-500">*</span></Label>
                            <Popover open={clientComboOpen} onOpenChange={setClientComboOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="combobox"
                                        role="combobox"
                                        aria-expanded={clientComboOpen}
                                        className="w-full justify-between"
                                        disabled={isLoading || loadingClients}
                                    >
                                        {formData.client_id
                                            ? clients.find((client) => client.id.toString() === formData.client_id)?.forename + ' ' + clients.find((client) => client.id.toString() === formData.client_id)?.surname
                                            : (loadingClients ? "Cargando clientes..." : "Selecciona un cliente")}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar cliente..." />
                                        <CommandList>
                                            <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                                            <CommandGroup>
                                                {clients.map((client) => (
                                                    <CommandItem
                                                        key={client.id}
                                                        value={getClientDisplayName(client)}
                                                        onSelect={() => {
                                                            handleSelectChange('client_id', client.id.toString());
                                                            setClientComboOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.client_id === client.id.toString() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {getClientDisplayName(client)}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label htmlFor="reception_date">Fecha de Recepción <span className="text-red-500">*</span></Label>
                            <Input
                                id="reception_date"
                                name="reception_date"
                                type="date"
                                value={formData.reception_date}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Estado <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleSelectChange('status', value)}
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
                    </div>

                    {formData.status === 'delivered' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="actual_delivery_date">Fecha Real de Entrega</Label>
                                <Input
                                    type="date"
                                    id="actual_delivery_date"
                                    name="actual_delivery_date"
                                    value={formData.actual_delivery_date}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="notes">Notas Generales</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            placeholder="Notas adicionales sobre la orden (máx. 1000 caracteres)"
                            maxLength={1000}
                            rows={3}
                        />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Artículos del Pedido <span className="text-red-500">*</span></h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addOrderItem}
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Agregar artículo
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {orderItems.map((item, index) => (
                                <Card key={index} className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-5">
                                            <Label>Tipo <span className="text-red-500">*</span></Label>
                                            <Popover
                                                open={subcategoryComboStates[index] || false}
                                                onOpenChange={(isOpen) => toggleSubcategoryCombo(index, isOpen)}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="combobox"
                                                        role="combobox"
                                                        aria-expanded={subcategoryComboStates[index] || false}
                                                        className="w-full justify-between"
                                                        disabled={isLoading || loadingSubcategories}
                                                    >
                                                        {item.subcategory_id
                                                            ? subcategories.find((sub) => sub.id.toString() === item.subcategory_id)?.category.name + ' - ' + subcategories.find((sub) => sub.id.toString() === item.subcategory_id)?.name
                                                            : (loadingSubcategories ? "Cargando..." : "Seleccione tipo")}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar tipo..." />
                                                        <CommandList>
                                                            <CommandEmpty>No se encontró el tipo.</CommandEmpty>
                                                            <CommandGroup>
                                                                {subcategories.map((subcategory) => (
                                                                    <CommandItem
                                                                        key={subcategory.id}
                                                                        value={getSubcategoryDisplayName(subcategory)}
                                                                        onSelect={() => {
                                                                            handleItemChange(index, 'subcategory_id', subcategory.id.toString());
                                                                            toggleSubcategoryCombo(index, false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                item.subcategory_id === subcategory.id.toString() ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {getSubcategoryDisplayName(subcategory)}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label>Cantidad <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="md:col-span-4">
                                            <Label>Notas del Item</Label>
                                            <Textarea
                                                value={item.notes}
                                                onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                                disabled={isLoading}
                                                placeholder="Notas específicas (opcional)"
                                                maxLength={500}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="md:col-span-1">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeOrderItem(index)}
                                                disabled={isLoading || orderItems.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {item.subcategory_id && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            {(() => {
                                                const subcategory = subcategories.find(sub => sub.id.toString() === item.subcategory_id);
                                                if (subcategory) {
                                                    const subtotal = parseFloat(subcategory.price) * item.quantity;
                                                    return `Precio unitario: $${parseFloat(subcategory.price).toFixed(2)} - Subtotal: $${subtotal.toFixed(2)}`;
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>

                        {orderItems.length === 0 && (
                            <div className="text-center text-muted-foreground py-4">
                                No hay artículos en el pedido. Haga clic en "Agregar artículo" para comenzar.
                            </div>
                        )}

                        {orderItems.length > 0 && (
                            <Card className="p-4 bg-muted/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        <span className="font-semibold">Total Estimado:</span>
                                    </div>
                                    <span className="text-2xl font-bold text-primary">
                                        ${calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                            </Card>
                        )}
                    </div>

                    <Separator />

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
                            disabled={isLoading || orderItems.length === 0}
                            className="min-w-[150px]"
                        >
                            {isLoading && <Spinner variant="circle" className="mr-2 h-4 w-4" />}
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}