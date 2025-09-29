import { getOrdersPaginated } from '@/api/getFetches';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Permission } from '@/config/routes';
import { useHasPermission } from '@/hooks/useHasPermission';
import type { Order, PaginatedOrdersResponse } from '@/types/api';
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
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Edit,
    MoreVertical,
    Search,
    Calendar,
    Package,
    User,
    DollarSign
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const columnHelper = createColumnHelper<Order>();

interface OrderActionsProps {
    order: Order;
    onEditOrder: (order: Order) => void;
}

function OrderActions({ order, onEditOrder }: OrderActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size='icon'
                >
                    <span className="sr-only">Abrir menú</span>
                    <MoreVertical className="h-4 w-4 text-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem
                    onClick={() => onEditOrder(order)}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar pedido</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    delivered: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En Proceso',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

export default function OrdersList() {
    const [paginationData, setPaginationData] = useState<PaginatedOrdersResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const canEdit = useHasPermission(Permission.EDIT_ORDERS);

    const columns = [
        columnHelper.accessor('order_number', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Número de Pedido
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="font-mono text-sm font-medium text-foreground">
                    {info.getValue()}
                </span>
            ),
            size: 150,
        }),
        columnHelper.accessor((row) => `${row.client.forename} ${row.client.surname}`, {
            id: 'clientName',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Cliente
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                        {info.getValue()}
                    </span>
                </div>
            ),
        }),
        columnHelper.accessor('status', {
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
                const status = info.getValue();
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}
                    >
                        {statusLabels[status]}
                    </span>
                );
            },
            size: 120,
        }),
        columnHelper.accessor('total', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                        {parseFloat(info.getValue()).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            ),
            size: 120,
        }),
        columnHelper.accessor('reception_date', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Fecha de Recepción
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                        {new Date(info.getValue()).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                </div>
            ),
            size: 160,
        }),
        columnHelper.accessor('estimated_delivery_date', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Fecha Estimada
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => {
                const date = info.getValue();
                return (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                            {date ? new Date(date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            }) : 'Sin fecha'}
                        </span>
                    </div>
                );
            },
            size: 160,
        }),
        columnHelper.accessor('items', {
            header: () => (
                <span className="font-medium text-muted-foreground">Artículos</span>
            ),
            cell: (info) => {
                const items = info.getValue();
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                            {totalItems} artículo{totalItems !== 1 ? 's' : ''}
                        </span>
                    </div>
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
                    {new Date(info.getValue()).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
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
                        <OrderActions
                            order={row.original}
                            onEditOrder={handleEditOrder}
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

    const handleEditOrder = (order: Order) => {
        // TODO: Implement edit order modal when it's created
        console.log('Edit order:', order);
    };

    const orders = paginationData?.data || [];

    const table = useReactTable({
        data: orders,
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

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const ordersData = await getOrdersPaginated({
                page: currentPage,
                per_page: perPage,
                search: debouncedSearch || undefined,
                status: statusFilter && statusFilter !== 'all' ? (statusFilter as 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled') : undefined,
                fecha_desde: dateFromFilter || undefined,
                fecha_hasta: dateToFilter || undefined,
            });
            setPaginationData(ordersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
            console.error('Error fetching orders:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, perPage, debouncedSearch, statusFilter, dateFromFilter, dateToFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        if ((statusFilter && statusFilter !== 'all') || dateFromFilter || dateToFilter) {
            setCurrentPage(1);
        }
    }, [statusFilter, dateFromFilter, dateToFilter]);

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-destructive font-medium">Error al cargar pedidos</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <Button
                        onClick={() => fetchOrders()}
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
                    <h1 className="text-2xl font-bold text-foreground">Lista de Pedidos</h1>
                    <p className="text-muted-foreground">
                        Gestiona los pedidos del sistema
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-card border border-border rounded-lg">
                <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por número de pedido, cliente o notas..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in_progress">En Proceso</SelectItem>
                        <SelectItem value="ready">Listo</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        placeholder="Desde"
                        value={dateFromFilter}
                        onChange={(e) => setDateFromFilter(e.target.value)}
                        className="w-40"
                    />
                    <span className="text-muted-foreground">hasta</span>
                    <Input
                        type="date"
                        placeholder="Hasta"
                        value={dateToFilter}
                        onChange={(e) => setDateToFilter(e.target.value)}
                        className="w-40"
                    />
                </div>

                {((statusFilter && statusFilter !== 'all') || dateFromFilter || dateToFilter) && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setStatusFilter('all');
                            setDateFromFilter('');
                            setDateToFilter('');
                        }}
                        className="text-sm"
                    >
                        Limpiar filtros
                    </Button>
                )}
            </div>

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
                                            <span className="text-muted-foreground">Cargando pedidos...</span>
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
                                        <p className="text-muted-foreground">No se encontraron pedidos</p>
                                        <p className="text-sm text-muted-foreground">
                                            {debouncedSearch || (statusFilter && statusFilter !== 'all') || dateFromFilter || dateToFilter
                                                ? 'Intenta ajustar tus filtros'
                                                : 'No hay pedidos registrados'}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isLoading && orders.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                        Mostrando {paginationData?.from || 0} a {paginationData?.to || 0} de {paginationData?.total || 0} pedido(s)
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
        </div>
    );
}
