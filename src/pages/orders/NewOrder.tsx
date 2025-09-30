import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { toast } from 'sonner';
import { Plus, Trash2, Calculator, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createOrder } from '@/api/postFetches';
import { getClientsList, getSubcategoriesList } from '@/api/getFetches';
import type { Client, Subcategory, CreateOrderRequest } from '@/types/api';

interface OrderItem {
    subcategory_id: string;
    quantity: number;
    notes: string;
    subcategory?: Subcategory;
}

const NewOrder: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fromDashboard = searchParams.get('from') === 'dashboard';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(true);
    const [clientComboOpen, setClientComboOpen] = useState(false);
    const [subcategoryComboStates, setSubcategoryComboStates] = useState<Record<number, boolean>>({});

    const [formData, setFormData] = useState({
        client_id: '',
        reception_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const [orderItems, setOrderItems] = useState<OrderItem[]>([
        { subcategory_id: '', quantity: 1, notes: '' }
    ]);

    useEffect(() => {
        loadClients();
        loadSubcategories();
    }, []);

    const loadClients = async () => {
        setLoadingClients(true);
        try {
            const clientsData = await getClientsList();
            setClients(clientsData);
        } catch (error) {
            console.error('Error loading clients:', error);
            toast.error('Error al cargar los clientes');
        } finally {
            setLoadingClients(false);
        }
    };

    const loadSubcategories = async () => {
        setLoadingSubcategories(true);
        try {
            const subcategoriesData = await getSubcategoriesList();
            setSubcategories(subcategoriesData);
        } catch (error) {
            console.error('Error loading subcategories:', error);
            toast.error('Error al cargar las subcategorías');
        } finally {
            setLoadingSubcategories(false);
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

    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
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

        if (!formData.client_id) {
            toast.error('El cliente es obligatorio');
            return;
        }

        if (!formData.reception_date) {
            toast.error('La fecha de recepción es obligatoria');
            return;
        }

        if (orderItems.length === 0) {
            toast.error('Debe agregar al menos un artículo a la orden');
            return;
        }

        const invalidItems = orderItems.filter(item => !item.subcategory_id || item.quantity < 1);
        if (invalidItems.length > 0) {
            toast.error('Todos los artículos deben tener un tipo válido y cantidad mayor a 0');
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData: CreateOrderRequest = {
                client_id: parseInt(formData.client_id),
                reception_date: formData.reception_date,
                notes: formData.notes.trim() || undefined,
                items: orderItems.map(item => ({
                    subcategory_id: parseInt(item.subcategory_id),
                    quantity: item.quantity,
                    notes: item.notes.trim() || undefined
                }))
            };

            await createOrder(orderData);
            toast.success('Orden creada exitosamente');
            navigate('/orders/list');
        } catch (error: unknown) {
            console.error('Error creating order:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
                if (axiosError.response?.data?.errors) {
                    const errorMessages = Object.values(axiosError.response.data.errors).flat();
                    errorMessages.forEach((message: string) => toast.error(message));
                } else {
                    toast.error('Error al crear la orden. Por favor, inténtalo de nuevo.');
                }
            } else {
                toast.error('Error al crear la orden. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (fromDashboard) {
            navigate('/');
        } else {
            navigate('/orders/list');
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

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-6 w-6" />
                        Crear Nueva Orden
                    </CardTitle>
                    <CardDescription>
                        Complete la información a continuación para crear una nueva orden. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="client">Cliente <span className="text-red-500">*</span></Label>
                                <Popover open={clientComboOpen} onOpenChange={setClientComboOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="combobox"
                                            role="combobox"
                                            aria-expanded={clientComboOpen}
                                            className="w-full justify-between"
                                            disabled={isSubmitting || loadingClients}
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
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">Notas Generales</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    placeholder="Notas adicionales sobre la orden (máx. 1000 caracteres)"
                                    maxLength={1000}
                                    rows={3}
                                />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Artículos de la Orden <span className="text-red-500">*</span></h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addOrderItem}
                                    disabled={isSubmitting}
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
                                                            disabled={isSubmitting || loadingSubcategories}
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
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="md:col-span-4">
                                                <Label>Notas del Item</Label>
                                                <Textarea
                                                    value={item.notes}
                                                    onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                                    disabled={isSubmitting}
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
                                                    disabled={isSubmitting || orderItems.length === 1}
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
                        </div>

                        <Separator />

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="min-w-[150px]"
                            >
                                {isSubmitting && <Spinner variant="circle" className="mr-2 h-4 w-4" />}
                                {isSubmitting ? 'Creando Orden...' : 'Crear Orden'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewOrder;
