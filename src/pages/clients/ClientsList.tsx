import { deleteClient } from '@/api/deleteFetches';
import { getClientsPaginated } from '@/api/getFetches';
import { restoreClient } from '@/api/patchFetches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import ViewModeToggle from '@/components/ui/ViewModeToggle';
import { Permission } from '@/config/routes';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useViewPreference } from '@/hooks/useViewPreference';
import type { Client, PaginatedClientsResponse } from '@/types/api';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnFiltersState,
    type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit, MapPin, MoreVertical, Search, UserCheck, UserX, Phone, Calendar, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ClientMapModal from '@/components/clients/ClientMapModal';
import EditClientModal from '@/components/clients/EditClientModal';
import { formatDateTime } from '@/lib/utils';

const columnHelper = createColumnHelper<Client>();

interface ClientActionsProps {
    client: Client;
    onEditClient: (client: Client) => void;
    onRefreshClients: () => void;
}

function ClientActions({ client, onEditClient, onRefreshClients }: ClientActionsProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggleClientStatus = async () => {
        setIsUpdating(true);
        try {
            if (client.active) {
                await deleteClient(client.id);
                toast.success(`Cliente ${client.forename} ${client.surname} desactivado correctamente`);
            } else {
                await restoreClient(client.id);
                toast.success(`Cliente ${client.forename} ${client.surname} activado correctamente`);
            }
            onRefreshClients();
        } catch (error) {
            console.error('Error toggling client status:', error);
            toast.error(`Error al ${client.active ? 'desactivar' : 'activar'} el cliente`);
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
                    onClick={() => onEditClient(client)}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar cliente</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleToggleClientStatus}
                    disabled={isUpdating}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                    {client.active ? (
                        <>
                            <UserX className="mr-2 h-4 w-4 text-destructive" />
                            <span className="text-destructive">Desactivar cliente</span>
                        </>
                    ) : (
                        <>
                            <UserCheck className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400">Activar cliente</span>
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function ClientsList() {
    const [paginationData, setPaginationData] = useState<PaginatedClientsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [viewMode, setViewMode] = useViewPreference('clients', 'table');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter] = useState<boolean | undefined>(undefined);

    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal states
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleWhatsAppClick = (phoneNumber: string) => {
        const cleanedNumber = phoneNumber.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanedNumber}`, '_blank');
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const canEdit = useHasPermission(Permission.EDIT_CLIENTS);

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
        columnHelper.accessor((row) => `${row.forename} ${row.surname}`, {
            id: 'fullName',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Nombre Completo
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="font-medium text-foreground">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('phone', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Teléfono
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="text-foreground">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('address', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Dirección
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="text-foreground">
                    {info.getValue()}
                </span>
            ),
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
        columnHelper.accessor('updated_at', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Fecha de Actualización
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
        columnHelper.display({
            id: 'map',
            header: () => (
                <span className="font-medium text-muted-foreground">Mapa</span>
            ),
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowMap(row.original)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
                >
                    <MapPin className="h-4 w-4" />
                </Button>
            ),
            size: 60,
        }),
        canEdit ?
            (
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <ClientActions
                            client={row.original}
                            onEditClient={handleEditClient}
                            onRefreshClients={refreshClients}
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

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setIsEditModalOpen(true);
    };

    const handleShowMap = (client: Client) => {
        setSelectedClient(client);
        setIsMapModalOpen(true);
    };

    const handleCloseMapModal = () => {
        setIsMapModalOpen(false);
        setSelectedClient(null);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedClient(null);
    };

    const handleClientUpdated = (updatedClient: Client) => {
        if (paginationData) {
            const updatedData = {
                ...paginationData,
                data: paginationData.data.map(client =>
                    client.id === updatedClient.id ? updatedClient : client
                )
            };
            setPaginationData(updatedData);
        }
    };

    const refreshClients = async () => {
        try {
            const clientsData = await getClientsPaginated({
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                active: activeFilter
            });
            setPaginationData(clientsData);
        } catch (err) {
            console.error('Error refreshing clients:', err);
        }
    };

    const clients = paginationData?.data || [];

    const table = useReactTable({
        data: clients,
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
        manualPagination: true,
        pageCount: paginationData?.last_page || 0,
    });

    const fetchClients = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const clientsData = await getClientsPaginated({
                page: currentPage,
                per_page: perPage,
                search: debouncedSearch || undefined,
                active: activeFilter
            });
            setPaginationData(clientsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar clientes');
            console.error('Error fetching clients:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, perPage, debouncedSearch, activeFilter]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);
    console.log(clients)

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-destructive font-medium">Error al cargar clientes</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <Button
                        onClick={() => fetchClients()}
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
                    <h1 className="text-2xl font-bold text-foreground">Lista de Clientes</h1>
                    <p className="text-muted-foreground">
                        Gestiona los clientes del sistema
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
                            placeholder="Buscar clientes..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
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
                                                <span className="text-muted-foreground">Cargando clientes...</span>
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
                                            <p className="text-muted-foreground">No se encontraron clientes</p>
                                            <p className="text-sm text-muted-foreground">
                                                {debouncedSearch ? 'Intenta ajustar tu búsqueda' : 'No hay clientes registrados'}
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
                                <span className="text-muted-foreground">Cargando clientes...</span>
                                <Spinner variant="ellipsis" className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    ) : clients.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {clients.map((client) => (
                                <Card key={client.id} className="transition-shadow hover:shadow-md">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <h3 className="font-semibold text-foreground">
                                                        {client.forename} {client.surname}
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Código: {client.id}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                        client.active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {client.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <button
                                                    onClick={() => handleWhatsAppClick(client.phone)}
                                                    className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
                                                    title="Enviar mensaje por WhatsApp"
                                                >
                                                    <Phone className="h-4 w-4" />
                                                    <span>{client.phone}</span>
                                                </button>
                                            </div>
                                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                                <span className="break-words">{client.address}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-2 border-t border-border">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDateTime(client.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleShowMap(client)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950 h-8 w-8 p-0"
                                                    title="Ver en mapa"
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                </Button>
                                                {canEdit && (
                                                    <ClientActions
                                                        client={client}
                                                        onEditClient={handleEditClient}
                                                        onRefreshClients={refreshClients}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="text-center space-y-2">
                                <p className="text-muted-foreground">No se encontraron clientes</p>
                                <p className="text-sm text-muted-foreground">
                                    {debouncedSearch ? 'Intenta ajustar tu búsqueda' : 'No hay clientes registrados'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isLoading && clients.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                        Mostrando {paginationData?.from || 0} a {paginationData?.to || 0} de {paginationData?.total || 0} cliente(s)
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Página {paginationData?.current_page || 1} de {paginationData?.last_page || 1}</span>
                    </div>
                </div>
            )}

            {paginationData && paginationData.last_page > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1 || isLoading}
                        className="flex items-center gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, paginationData.last_page) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    disabled={isLoading}
                                    className="w-8 h-8 p-0"
                                >
                                    {page}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(paginationData.last_page, currentPage + 1))}
                        disabled={currentPage >= paginationData.last_page || isLoading}
                        className="flex items-center gap-1"
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <ClientMapModal
                client={selectedClient}
                isOpen={isMapModalOpen}
                onClose={handleCloseMapModal}
            />

            <EditClientModal
                client={selectedClient}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onClientUpdated={handleClientUpdated}
            />
        </div>
    );
}
