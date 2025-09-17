import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { toast } from 'sonner';
import { updateCategory } from '@/api/putFetches';
import type { Category, UpdateCategoryRequest } from '@/types/api';

interface EditCategoryModalProps {
    category: Category | null;
    isOpen: boolean;
    onClose: () => void;
    onCategoryUpdated: (category: Category) => void;
}

export default function EditCategoryModal({ category, isOpen, onClose, onCategoryUpdated }: EditCategoryModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<UpdateCategoryRequest>({
        name: '',
        description: '',
        active: true
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || '',
                active: category.active
            });
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        if (!formData.name?.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedCategory = await updateCategory(category.id, {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                active: formData.active
            });
            toast.success('Categoría actualizada correctamente');
            onCategoryUpdated(updatedCategory);
            onClose();
        } catch (error: unknown) {
            console.error('Error updating category:', error);
            
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
                if (axiosError.response?.data?.errors) {
                    const errorMessages = Object.values(axiosError.response.data.errors).flat();
                    errorMessages.forEach((message: string) => toast.error(message));
                } else {
                    toast.error('Error al actualizar la categoría');
                }
            } else {
                toast.error('Error al actualizar la categoría');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof UpdateCategoryRequest, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!category) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Categoría</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Nombre de la categoría"
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
                            placeholder="Descripción de la categoría (opcional)"
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
                        <Label htmlFor="active">Categoría activa <span className="text-red-500">*</span></Label>
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