import { useEffect, useState } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    type SortingState,
    type ColumnFiltersState,
} from '@tanstack/react-table';
import { getUsersList } from '@/api/getFetches';
import { deleteUser } from '@/api/deleteFetches';
import { restoreUser } from '@/api/patchFetches';
import type { UserWithPermissions } from '@/types/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ViewModeToggle from '@/components/ui/ViewModeToggle';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, Search, Edit, UserX, UserCheck, MoreVertical, User, Mail, Calendar } from 'lucide-react';
import EditUserModal from '@/components/users/EditUserModal';
import { toast } from 'sonner';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useViewPreference } from '@/hooks/useViewPreference';
import { Permission } from '@/config/routes';
import { formatDateTime } from '@/lib/utils';

const columnHelper = createColumnHelper<UserWithPermissions>();

interface UserActionsProps {
    user: UserWithPermissions;
    onEditUser: (user: UserWithPermissions) => void;
    onRefreshUsers: () => void;
}

function UserActions({ user, onEditUser, onRefreshUsers }: UserActionsProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggleUserStatus = async () => {
        setIsUpdating(true);
        try {
            if (user.active) {
                await deleteUser(user.id);
                toast.success(`Usuario ${user.name} desactivado correctamente`);
            } else {
                await restoreUser(user.id);
                toast.success(`Usuario ${user.name} activado correctamente`);
            }
            onRefreshUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
            toast.error(`Error al ${user.active ? 'desactivar' : 'activar'} el usuario`);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size='icon'
                    disabled={isUpdating}
                >
                    <span className="sr-only">Abrir menú</span>
                    {isUpdating ? (
                        <Spinner variant="circle" className="h-4 w-4" />
                    ) : (
                        <MoreVertical className="h-4 w-4 text-foreground" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem
                    onClick={() => onEditUser(user)}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar usuario</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleToggleUserStatus}
                    disabled={isUpdating}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                    {user.active ? (
                        <>
                            <UserX className="mr-2 h-4 w-4 text-destructive" />
                            <span className="text-destructive">Desactivar usuario</span>
                        </>
                    ) : (
                        <>
                            <UserCheck className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400">Activar usuario</span>
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function UsersList() {
    const [users, setUsers] = useState<UserWithPermissions[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [viewMode, setViewMode] = useViewPreference('users', 'table');

    const [editingUser, setEditingUser] = useState<UserWithPermissions | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const canEdit = useHasPermission(Permission.EDIT_USERS);

    const columns = [
        columnHelper.accessor('id', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Código de Referencia
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="font-mono text-sm text-muted-foreground pl-6">
                    {info.getValue()}
                </span>
            ),
            size: 80,
        }),
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Nombre
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="font-medium text-foreground">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('username', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Usuario
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="font-mono text-sm text-muted-foreground">
                    @{info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('email', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="text-foreground">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('role.displayName', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Rol
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => {
                const role = info.row.original.role;
                const isAdmin = role.name === 'admin';
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isAdmin
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}
                    >
                        {info.getValue()}
                    </span>
                );
            },
            size: 120,
        }),
        columnHelper.accessor('active', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Estado
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => {
                const isActive = info.getValue();
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                    >
                        {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                );
            },
            size: 100,
        }),
        columnHelper.accessor('created_at', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Fecha de Creación
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="text-sm text-muted-foreground">
                    {formatDateTime(info.getValue())}
                </span>
            ),
            size: 160,
        }),
        canEdit ?
            (
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <UserActions
                            user={row.original}
                            onEditUser={handleEditUser}
                            onRefreshUsers={refreshUsers}
                        />
                    ),
                    size: 80,
                })
            ) : (
                columnHelper.display({
                    id: 'none',
                    header: '',
                    cell: () => null,
                    size: 0,
                })
            ),
    ];

    const handleEditUser = (user: UserWithPermissions) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleUserUpdated = (updatedUser: UserWithPermissions) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === updatedUser.id ? updatedUser : user
            )
        );
    };

    const refreshUsers = async () => {
        try {
            const usersData = await getUsersList();
            setUsers(usersData);
        } catch (err) {
            console.error('Error refreshing users:', err);
        }
    };

    const table = useReactTable({
        data: users,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
    });
    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const usersData = await getUsersList();
            setUsers(usersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
            console.error('Error fetching users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-destructive font-medium">Error al cargar usuarios</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <Button
                        onClick={() => fetchUsers()}
                        variant="outline"
                        size="sm"
                        className="mt-4 text-foreground"
                    >
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Lista de Usuarios</h1>
                    <p className="text-muted-foreground">
                        Gestiona los usuarios del sistema
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ViewModeToggle 
                        viewMode={viewMode} 
                        onViewModeChange={setViewMode} 
                    />
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar usuarios..."
                            value={globalFilter ?? ''}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="pl-9 w-64"
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="rounded-lg border border-border bg-card">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-b border-border">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-48">
                                        <div className="flex items-center justify-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Cargando usuarios...</span>
                                                <Spinner variant="ellipsis" className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className="border-b border-border transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-muted-foreground">No se encontraron usuarios</p>
                                            <p className="text-sm text-muted-foreground">
                                                {globalFilter ? 'Intenta ajustar tu búsqueda' : 'No hay usuarios registrados'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Cargando usuarios...</span>
                                <Spinner variant="ellipsis" className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    ) : table.getFilteredRowModel().rows?.length ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {table.getFilteredRowModel().rows.map((row) => {
                                const user = row.original;
                                const isAdmin = user.role.name === 'admin';
                                return (
                                    <Card key={user.id} className="transition-shadow hover:shadow-md">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <h3 className="font-medium text-foreground">
                                                            {user.name}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <span className="font-mono">@{user.username}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                            user.active
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}
                                                    >
                                                        {user.active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-foreground">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            isAdmin
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}
                                                    >
                                                        {user.role.displayName}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>ID: {user.id}</span>
                                                </div>
                                                {canEdit && (
                                                    <UserActions
                                                        user={user}
                                                        onEditUser={handleEditUser}
                                                        onRefreshUsers={refreshUsers}
                                                    />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="text-center space-y-2">
                                <p className="text-muted-foreground">No se encontraron usuarios</p>
                                <p className="text-sm text-muted-foreground">
                                    {globalFilter ? 'Intenta ajustar tu búsqueda' : 'No hay usuarios registrados'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isLoading && users.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                        Mostrando {table.getFilteredRowModel().rows.length} de {users.length} usuario(s)
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Total: {users.length} usuario(s)</span>
                    </div>
                </div>
            )}

            <EditUserModal
                user={editingUser}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onUserUpdated={handleUserUpdated}
            />
        </div>
    );
}
