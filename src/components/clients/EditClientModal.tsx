import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import LocationPicker from '@/components/ui/LocationPicker';
import { toast } from 'sonner';
import { updateClient } from '@/api/putFetches';
import type { Client, UpdateClientRequest } from '@/types/api';

interface EditClientModalProps {
    client: Client | null;
    isOpen: boolean;
    onClose: () => void;
    onClientUpdated: (client: Client) => void;
}

export default function EditClientModal({ client, isOpen, onClose, onClientUpdated }: EditClientModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<UpdateClientRequest>({
        forename: '',
        surname: '',
        phone: '',
        address: '',
        latitude: '0',
        longitude: '0',
        active: true
    });

    useEffect(() => {
        if (client) {
            setFormData({
                forename: client.forename,
                surname: client.surname,
                phone: client.phone,
                address: client.address,
                latitude: client.latitude,
                longitude: client.longitude,
                active: client.active
            });
        }
    }, [client]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client) return;

        setIsSubmitting(true);
        try {
            const updatedClient = await updateClient(client.id, formData);
            toast.success('Cliente actualizado correctamente');
            onClientUpdated(updatedClient);
            onClose();
        } catch (error) {
            console.error('Error updating client:', error);
            toast.error('Error al actualizar el cliente');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof UpdateClientRequest, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLocationChange = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString()
        }));
    };

    if (!client) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="forename">Nombre <span className="text-red-500">*</span></Label>
                            <Input
                                id="forename"
                                value={formData.forename}
                                onChange={(e) => handleInputChange('forename', e.target.value)}
                                placeholder="Nombre"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surname">Apellido <span className="text-red-500">*</span></Label>
                            <Input
                                id="surname"
                                value={formData.surname}
                                onChange={(e) => handleInputChange('surname', e.target.value)}
                                placeholder="Apellido"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono <span className="text-red-500">*</span></Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Número de teléfono"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección <span className="text-red-500">*</span></Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="Dirección del cliente"
                            required
                        />
                    </div>

                    <LocationPicker
                        latitude={parseFloat(formData.latitude || '0')}
                        longitude={parseFloat(formData.longitude || '0')}
                        onLocationChange={handleLocationChange}
                    />

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => handleInputChange('active', e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="active">Cliente activo</Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner variant="circle" className="mr-2 h-4 w-4" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}