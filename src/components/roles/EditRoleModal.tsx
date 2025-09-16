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
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { getPermissionsList } from '@/api/getFetches';
import { updateRolePermissions } from '@/api/patchFetches';
import type { Role, Permission } from '@/types/api';

interface EditRoleModalProps {
    role: Role | null;
    isOpen: boolean;
    onClose: () => void;
    onRoleUpdated: (updatedRole: Role) => void;
}

export default function EditRoleModal({
    role,
    isOpen,
    onClose,
    onRoleUpdated,
}: EditRoleModalProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

    useEffect(() => {
        if (role && role.permissions) {
            setSelectedPermissions(role.permissions.map(p => p.id));
        } else {
            setSelectedPermissions([]);
        }
    }, [role]);

    useEffect(() => {
        if (isOpen) {
            const loadPermissions = async () => {
                try {
                    setIsLoadingPermissions(true);
                    const permissionsData = await getPermissionsList();
                    setPermissions(permissionsData);
                } catch (error) {
                    console.error('Error loading permissions:', error);
                    toast.error('Error al cargar los permisos');
                } finally {
                    setIsLoadingPermissions(false);
                }
            };
            
            loadPermissions();
        }
    }, [isOpen]);

    const handlePermissionToggle = (permissionId: number) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!role) {
            return;
        }

        setIsLoading(true);
        try {
            const updatedRole = await updateRolePermissions(role.id, selectedPermissions);

            toast.success('Permisos del rol actualizados correctamente');
            onRoleUpdated(updatedRole);
            onClose();
        } catch (error) {
            console.error('Error updating role permissions:', error);
            toast.error('Error al actualizar los permisos del rol');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (role && role.permissions) {
            setSelectedPermissions(role.permissions.map(p => p.id));
        }
        onClose();
    };

    if (!role) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[600px] bg-background border-border max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        Editar Permisos del Rol
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Modifica los permisos asignados al rol {role.displayName}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-hidden">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">
                            Permisos disponibles
                        </Label>
                        
                        {isLoadingPermissions ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Cargando permisos...</span>
                                    <Spinner variant="ellipsis" className="h-5 w-5 text-foreground" />
                                </div>
                            </div>
                        ) : (
                            <div className="border border-input rounded-md bg-background overflow-hidden">
                                <div className="max-h-[300px] overflow-y-auto p-3 space-y-2">
                                    {permissions.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-4">
                                            No hay permisos disponibles
                                        </div>
                                    ) : (
                                        permissions.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`permission-${permission.id}`}
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onChange={() => handlePermissionToggle(permission.id)}
                                                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                                                    disabled={isLoading}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <label
                                                        htmlFor={`permission-${permission.id}`}
                                                        className="block text-sm font-medium text-foreground cursor-pointer"
                                                    >
                                                        {permission.displayName}
                                                    </label>
                                                    {permission.description && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {permission.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground mt-2">
                            {selectedPermissions.length} de {permissions.length} permisos seleccionados
                        </div>
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
                            disabled={isLoading || isLoadingPermissions}
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
