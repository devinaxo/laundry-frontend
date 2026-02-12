import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { toast } from 'sonner';
import { updateSubcategory } from '@/api/putFetches';
import { getCategoriesList } from '@/api/getFetches';
import type { Subcategory, UpdateSubcategoryRequest, Category } from '@/types/api';

interface EditSubcategoryModalProps {
    subcategory: Subcategory | null;
    isOpen: boolean;
    onClose: () => void;
    onSubcategoryUpdated: (subcategory: Subcategory) => void;
}

export default function EditSubcategoryModal({ subcategory, isOpen, onClose, onSubcategoryUpdated }: EditSubcategoryModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [formData, setFormData] = useState<UpdateSubcategoryRequest>({
        category_id: 0,
        name: '',
        description: '',
        price: 0,
        active: true
    });

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        if (subcategory) {
            setFormData({
                category_id: subcategory.category_id,
                name: subcategory.name,
                description: subcategory.description || '',
                price: parseFloat(subcategory.price),
                active: subcategory.active
            });
        }
    }, [subcategory]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subcategory) return;

        if (!formData.name?.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }

        if (!formData.category_id) {
            toast.error('La categoría es obligatoria');
            return;
        }

        if (!formData.price || formData.price <= 0) {
            toast.error('El precio debe ser mayor a 0');
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedSubcategory = await updateSubcategory(subcategory.id, {
                category_id: formData.category_id,
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                price: formData.price,
                active: formData.active
            });
            toast.success('Subcategoría actualizada correctamente', {position: 'top-right'});
            onSubcategoryUpdated(updatedSubcategory);
            onClose();
        } catch (error: unknown) {
            console.error('Error updating subcategory:', error);
            
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
                if (axiosError.response?.data?.errors) {
                    const errorMessages = Object.values(axiosError.response.data.errors).flat();
                    errorMessages.forEach((message: string) => toast.error(message));
                } else {
                    toast.error('Error al actualizar la subcategoría');
                }
            } else {
                toast.error('Error al actualizar la subcategoría');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof UpdateSubcategoryRequest, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!subcategory) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Subcategoría</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.category_id?.toString() || ''}
                            onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                            disabled={isSubmitting || loadingCategories}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
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
                    
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio <span className="text-red-500">*</span></Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price || ''}
                            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                            placeholder="Precio de la subcategoría"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Nombre de la subcategoría"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Descripción de la subcategoría (opcional)"
                            disabled={isSubmitting}
                        />
                    </div>


                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => handleInputChange('active', e.target.checked)}
                            className="rounded border-gray-300"
                            disabled={isSubmitting}
                        />
                        <Label htmlFor="active">Subcategoría activa <span className="text-red-500">*</span></Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose} 
                            disabled={isSubmitting}
                        >
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