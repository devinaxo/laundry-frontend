import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import LocationPicker from '@/components/ui/LocationPicker';
import { createClient } from '@/api/postFetches';

const NewClient: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        forename: '',
        surname: '',
        phone: '',
        address: '',
        latitude: '-24.85884270',
        longitude: '-65.46510335'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLocationChange = (latitude: number, longitude: number) => {
        setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString()
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.forename.trim() || !formData.surname.trim() || !formData.phone.trim() || !formData.address.trim()) {
            toast.error('Por favor, completa todos los campos obligatorios');
            return;
        }

        if (formData.latitude === '0' && formData.longitude === '0') {
            toast.error('Por favor, selecciona una ubicación en el mapa');
            return;
        }

        setIsSubmitting(true);

        try {
            await createClient({
                forename: formData.forename.trim(),
                surname: formData.surname.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                latitude: formData.latitude,
                longitude: formData.longitude,
                active: true
            });

            toast.success('Cliente creado exitosamente');
            navigate('/clients/list');
        } catch (error: unknown) {
            console.error('Error creating client:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
                if (axiosError.response?.data?.errors) {
                    const errorMessages = Object.values(axiosError.response.data.errors).flat();
                    errorMessages.forEach((message: string) => toast.error(message));
                } else {
                    toast.error('Error al crear el cliente. Por favor, inténtalo de nuevo.');
                }
            } else {
                toast.error('Error al crear el cliente. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/clients/list');
    };

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Crear Nuevo Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="forename">Nombre <span className="text-red-500">*</span></Label>
                                <Input
                                    id="forename"
                                    name="forename"
                                    type="text"
                                    value={formData.forename}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isSubmitting}
                                    placeholder='Juan'
                                />
                            </div>
                            <div>
                                <Label htmlFor="surname">Apellido <span className="text-red-500">*</span></Label>
                                <Input
                                    id="surname"
                                    name="surname"
                                    type="text"
                                    value={formData.surname}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isSubmitting}
                                    placeholder='Pérez'
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="phone">Teléfono <span className="text-red-500">*</span></Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                                placeholder='3871234567'
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Dirección <span className="text-red-500">*</span></Label>
                            <Input
                                id="address"
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                                placeholder="Ramos E. 515"
                            />
                        </div>

                        <div>
                            <div className="mt-2">
                                <LocationPicker
                                    latitude={parseFloat(formData.latitude)}
                                    longitude={parseFloat(formData.longitude)}
                                    onLocationChange={handleLocationChange}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
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
                            >
                                {isSubmitting ? 'Creando...' : 'Crear Cliente'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewClient;