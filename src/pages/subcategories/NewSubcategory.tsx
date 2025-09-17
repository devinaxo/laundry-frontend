import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createSubcategory } from '@/api/postFetches';
import { getCategoriesList } from '@/api/getFetches';
import type { Category } from '@/types/api';

const NewSubcategory: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        description: '',
        price: '',
        active: true
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoadingCategories(true);
        try {
            const categoriesData = await getCategoriesList();
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Error al cargar las categorías');
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            category_id: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }

        if (!formData.category_id) {
            toast.error('La categoría es obligatoria');
            return;
        }

        const price = parseFloat(formData.price);
        if (!formData.price || isNaN(price) || price <= 0) {
            toast.error('El precio debe ser mayor a 0');
            return;
        }

        setIsSubmitting(true);

        try {
            await createSubcategory({
                category_id: parseInt(formData.category_id),
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                price: price,
                active: formData.active
            });

            toast.success('Subcategoría creada exitosamente');
            navigate('/subcategories/list');
        } catch (error: unknown) {
            console.error('Error creating subcategory:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
                if (axiosError.response?.data?.errors) {
                    const errorMessages = Object.values(axiosError.response.data.errors).flat();
                    errorMessages.forEach((message: string) => toast.error(message));
                } else {
                    toast.error('Error al crear la subcategoría. Por favor, inténtalo de nuevo.');
                }
            } else {
                toast.error('Error al crear la subcategoría. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/subcategories/list');
    };

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Crear Nueva Subcategoría</CardTitle>
                    <CardDescription>
                        Complete la información a continuación para crear una nueva subcategoría. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="category">Categoría <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={handleSelectChange}
                                disabled={isSubmitting || loadingCategories}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingCategories ? "Cargando categorías..." : "Selecciona una categoría"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                                placeholder="Nombre de la subcategoría"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                name="description"
                                type="text"
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                placeholder="Descripción de la subcategoría (opcional)"
                            />
                        </div>

                        <div>
                            <Label htmlFor="price">Precio <span className="text-red-500">*</span></Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                                placeholder="Precio de la subcategoría"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="active"
                                name="active"
                                checked={formData.active}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="active">Subcategoría activa <span className="text-red-500">*</span></Label>
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
                                {isSubmitting ? 'Creando...' : 'Crear Subcategoría'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewSubcategory;
