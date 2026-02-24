import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUser } from '@/api/postFetches';
import { getRolesList } from '@/api/getFetches';
import type { CreateUserRequest, Role } from '@/types/api';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { translateError, translateValidationErrors } from '@/lib/errorTranslations';

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role_id: number | null;
  active: boolean;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role_id?: string;
}

const NewUser: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    role_id: null,
    active: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRolesList();
        setRoles(rolesData);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Error al cargar los roles');
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido.';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Por favor, ingrese una dirección de correo electrónico válida.';
      }
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida.';
    } else {
      if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (formData.password.length > 32) {
        newErrors.password = 'La contraseña no debe exceder los 32 caracteres.';
      }
    }

    if (!formData.role_id) {
      newErrors.role_id = 'El rol es requerido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'active' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role_id: parseInt(value)
    }));

    if (errors.role_id) {
      setErrors(prev => ({
        ...prev,
        role_id: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData: CreateUserRequest = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role_id: formData.role_id!,
        active: formData.active,
      };

      await createUser(userData);
      toast.success('Usuario creado exitosamente');
      navigate('/users/list');
    } catch (error: unknown) {
      console.error('Error creating user:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
        if (axiosError.response?.data?.errors) {
          const translatedErrors = translateValidationErrors(axiosError.response.data.errors);
          const serverErrors: FormErrors = {};

          Object.keys(translatedErrors).forEach(field => {
            if (field in formData) {
              serverErrors[field as keyof FormErrors] = translatedErrors[field];
            }
          });

          setErrors(serverErrors);
        } else {
          const originalMessage = axiosError.response?.data?.message || 'Failed to create user';
          const translatedMessage = translateError(originalMessage);
          toast.error(translatedMessage);
        }
      } else {
        toast.error('Error al crear el usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users/list');
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Crear un nuevo usuario</CardTitle>
          <CardDescription>
            Complete la información a continuación para crear una nueva cuenta de usuario. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </CardDescription>
        </CardHeader>
        {isLoadingRoles ? (
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Cargando formulario</span>
                <Spinner variant="ellipsis" className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="Ingrese el nombre completo"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario <span className="text-red-500">*</span></Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  className={errors.username ? 'border-red-500' : ''}
                  placeholder="Ingrese el nombre de usuario"
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="Ingrese la dirección de correo electrónico"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={errors.password ? 'border-red-500' : ''}
                  placeholder="Ingrese la contraseña (6-32 caracteres)"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <p className="text-sm text-gray-500">
                  La contraseña debe tener entre 6 y 32 caracteres.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol <span className="text-red-500">*</span></Label>
                <Select onValueChange={handleRoleChange}>
                  <SelectTrigger className={errors.role_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_id && (
                  <p className="text-sm text-red-500">{errors.role_id}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={handleInputChange('active')}
                  className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="active" className="text-sm font-medium">
                  ¿Activar usuario al crearlo? <span className="text-red-500">*</span>
                </Label>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="submit"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default NewUser;
