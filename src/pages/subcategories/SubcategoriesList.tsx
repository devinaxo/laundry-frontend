import { getSubcategoriesList } from '@/api/getFetches';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ViewModeToggle from '@/components/ui/ViewModeToggle';
import { Permission } from '@/config/routes';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useViewPreference } from '@/hooks/useViewPreference';
import type { Subcategory } from '@/types/api';
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
import { ArrowUpDown, Edit, MoreVertical, Search, Tag, Calendar, FileText, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import EditSubcategoryModal from '@/components/subcategories/EditSubcategoryModal';
import { formatDateTime } from '@/lib/utils';

const columnHelper = createColumnHelper<Subcategory>();

interface SubcategoryActionsProps {
    subcategory: Subcategory;
    onEditSubcategory: (subcategory: Subcategory) => void;
}

function SubcategoryActions({ subcategory, onEditSubcategory }: SubcategoryActionsProps) {
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
                    onClick={() => onEditSubcategory(subcategory)}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar subcategoría</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function SubcategoriesList() {
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [viewMode, setViewMode] = useViewPreference('subcategories', 'table');

    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const canEdit = useHasPermission(Permission.EDIT_SUBCATEGORIES);

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
        columnHelper.accessor('category.name', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Categoría
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
                    {info.getValue()}
                </span>
            ),
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
                <span className="font-mono font-medium text-muted-foreground">
                    {info.getValue().toUpperCase()}
                </span>
            ),
        }),
        columnHelper.accessor('description', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Descripción
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="font-medium text-muted-foreground">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('price', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                >
                    Precio
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: (info) => (
                <span className="font-mono font-medium text-muted-foreground">
                    ${parseFloat(info.getValue()).toFixed(2)}
                </span>
            ),
            size: 100,
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
                        <SubcategoryActions
                            subcategory={row.original}
                            onEditSubcategory={handleEditSubcategory}
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

    const handleEditSubcategory = (subcategory: Subcategory) => {
        setEditingSubcategory(subcategory);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingSubcategory(null);
    };

    const handleSubcategoryUpdated = (updatedSubcategory: Subcategory) => {
        setSubcategories(prevSubcategories =>
            prevSubcategories.map(subcategory =>
                subcategory.id === updatedSubcategory.id ? updatedSubcategory : subcategory
            )
        );
    };

    const table = useReactTable({
        data: subcategories,
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

    const fetchSubcategories = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const subcategoriesData = await getSubcategoriesList();
            console.log('Fetched subcategories:', subcategoriesData);
            setSubcategories(subcategoriesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar subcategorías');
            console.error('Error fetching subcategories:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubcategories();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-destructive font-medium">Error al cargar subcategorías</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <Button
                        onClick={() => fetchSubcategories()}
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
                    <h1 className="text-2xl font-bold text-foreground">Lista de Subcategorías</h1>
                    <p className="text-muted-foreground">
                        Gestiona las subcategorías del sistema
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
                            placeholder="Buscar subcategorías..."
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
                                                <span className="text-muted-foreground">Cargando subcategorías...</span>
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
                                            <p className="text-muted-foreground">No se encontraron subcategorías</p>
                                            <p className="text-sm text-muted-foreground">
                                                {globalFilter ? 'Intenta ajustar tu búsqueda' : 'No hay subcategorías registradas'}
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
                                <span className="text-muted-foreground">Cargando subcategorías...</span>
                                <Spinner variant="ellipsis" className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    ) : table.getFilteredRowModel().rows?.length ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {table.getFilteredRowModel().rows.map((row) => {
                                const subcategory = row.original;
                                return (
                                    <Card key={subcategory.id} className="transition-shadow hover:shadow-md">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                                        <h3 className="font-mono font-medium text-muted-foreground">
                                                            {subcategory.name.toUpperCase()}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
                                                            {subcategory.category.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                        subcategory.active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {subcategory.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <span className="text-sm text-muted-foreground">{subcategory.description}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-mono font-medium text-foreground">
                                                        ${parseFloat(subcategory.price).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>ID: {subcategory.id}</span>
                                                </div>
                                                {canEdit && (
                                                    <SubcategoryActions
                                                        subcategory={subcategory}
                                                        onEditSubcategory={handleEditSubcategory}
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
                                <p className="text-muted-foreground">No se encontraron subcategorías</p>
                                <p className="text-sm text-muted-foreground">
                                    {globalFilter ? 'Intenta ajustar tu búsqueda' : 'No hay subcategorías registradas'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isLoading && subcategories.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                        Mostrando {table.getFilteredRowModel().rows.length} de {subcategories.length} subcategoría(s)
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Total: {subcategories.length} subcategoría(s)</span>
                    </div>
                </div>
            )}

            <EditSubcategoryModal
                subcategory={editingSubcategory}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSubcategoryUpdated={handleSubcategoryUpdated}
            />
        </div>
    );
}
