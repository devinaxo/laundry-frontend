import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { updateUser } from '@/api/postFetches';
import { getRolesList } from '@/api/getFetches';
import type { UserWithPermissions, Role } from '@/types/api';

interface EditUserModalProps {
    user: UserWithPermissions | null;
    isOpen: boolean;
    onClose: () => void;
    onUserUpdated: (updatedUser: UserWithPermissions) => void;
}

interface EditableUserData {
    name: string;
    username: string;
    email: string;
    role_id: number;
}

interface FormErrors {
    name?: string;
    username?: string;
    email?: string;
    role_id?: string;
}

export default function EditUserModal({
    user,
    isOpen,
    onClose,
    onUserUpdated,
}: EditUserModalProps) {
    const [formData, setFormData] = useState<EditableUserData>({
        name: '',
        username: '',
        email: '',
        role_id: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                username: user.username,
                email: user.email,
                role_id: user.role_id,
            });
            setErrors({});
        } else {
            setFormData({
                name: '',
                username: '',
                email: '',
                role_id: 0,
            });
            setErrors({});
        }
    }, [user]);

    useEffect(() => {
        if (isOpen) {
            const loadRoles = async () => {
                try {
                    setIsLoadingRoles(true);
                    const rolesData = await getRolesList();
                    setRoles(rolesData);
                } catch (error) {
                    console.error('Error loading roles:', error);
                    toast.error('Error al cargar los roles');
                } finally {
                    setIsLoadingRoles(false);
                }
            };
            
            loadRoles();
        }
    }, [isOpen]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido';
        } else if (formData.username.length < 3) {
            newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El email no tiene un formato válido';
        }

        if (!formData.role_id || formData.role_id === 0) {
            newErrors.role_id = 'Debes seleccionar un rol';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof EditableUserData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const updatedUser = await updateUser(user.id, formData);

            toast.success('Usuario actualizado correctamente');
            onUserUpdated(updatedUser);
            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Error al actualizar el usuario');

            if (error instanceof Error && error.message.includes('validation')) {
                toast.error('Por favor, verifica los datos ingresados');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name,
                username: user.username,
                email: user.email,
                role_id: user.role_id,
            });
        }
        setErrors({});
        onClose();
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[425px] bg-background border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        Editar Usuario
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Modifica la información del usuario {user.name}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-foreground">
                            Nombre completo
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ingresa el nombre completo"
                            className={`bg-background border-input text-foreground placeholder:text-muted-foreground ${errors.name ? 'border-destructive focus:border-destructive' : ''
                                }`}
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-foreground">
                            Nombre de usuario
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            placeholder="Ingresa el nombre de usuario"
                            className={`bg-background border-input text-foreground placeholder:text-muted-foreground ${errors.username ? 'border-destructive focus:border-destructive' : ''
                                }`}
                            disabled={isLoading}
                        />
                        {errors.username && (
                            <p className="text-sm text-destructive">{errors.username}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            Correo electrónico
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Ingresa el correo electrónico"
                            className={`bg-background border-input text-foreground placeholder:text-muted-foreground ${errors.email ? 'border-destructive focus:border-destructive' : ''
                                }`}
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-foreground">
                            Rol
                        </Label>
                        <Select
                            value={formData.role_id.toString()}
                            onValueChange={(value) => handleInputChange('role_id', parseInt(value))}
                            disabled={isLoading || isLoadingRoles}
                        >
                            <SelectTrigger className={`bg-background border-input text-foreground ${
                                errors.role_id ? 'border-destructive focus:border-destructive' : ''
                            }`}>
                                {isLoadingRoles ? (
                                    <div className="flex items-center">
                                        <Spinner variant="circle" className="h-4 w-4 mr-2" />
                                        <span className="text-muted-foreground">Cargando roles...</span>
                                    </div>
                                ) : (
                                    <SelectValue placeholder="Selecciona un rol" />
                                )}
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                {isLoadingRoles ? (
                                    <div className="flex items-center justify-center p-3">
                                        <Spinner variant="circle" className="h-4 w-4 mr-2" />
                                        <span className="text-sm text-muted-foreground">Cargando roles...</span>
                                    </div>
                                ) : (
                                    roles.map((role) => (
                                        <SelectItem 
                                            key={role.id} 
                                            value={role.id.toString()}
                                            className="hover:bg-accent focus:bg-accent"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        role.name === 'admin'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}
                                                >
                                                    {role.displayName}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.role_id && (
                            <p className="text-sm text-destructive">{errors.role_id}</p>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="border-input hover:bg-accent text-foreground hover:text-accent-foreground"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Spinner variant="circle" className="h-4 w-4" />
                                    <span>Guardando...</span>
                                </div>
                            ) : (
                                'Guardar cambios'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
