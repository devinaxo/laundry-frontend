import { getCategoriesList } from '@/api/getFetches';
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
import type { Category } from '@/types/api';
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
import { ArrowUpDown, Edit, MoreVertical, Search, Tag, Calendar, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import EditCategoryModal from '@/components/categories/EditCategoryModal';
import { formatDateTime } from '@/lib/utils';

const columnHelper = createColumnHelper<Category>();

interface UserActionsProps {
    category: Category;
    onEditCategory: (category: Category) => void;
}

function UserActions({ category, onEditCategory }: UserActionsProps) {

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
            <DropdownMenuContent align="end" className="bg-popover border-sidebar-border">
                <DropdownMenuItem
                    onClick={() => onEditCategory(category)}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar categoría</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function CategoriesList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [viewMode, setViewMode] = useViewPreference('categories', 'table');

    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const canEdit = useHasPermission(Permission.EDIT_CATEGORIES);

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
        canEdit ?
            (
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <UserActions
                            category={row.original}
                            onEditCategory={handleEditCategory}
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

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingCategory(null);
    };

    const handleCategoryUpdated = (updatedCategory: Category) => {
        setCategories(prevCategories =>
            prevCategories.map(category =>
                category.id === updatedCategory.id ? updatedCategory : category
            )
        );
    };

    const table = useReactTable({
        data: categories,
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
    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const categoriesData = await getCategoriesList();
            setCategories(categoriesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar categorías');
            console.error('Error fetching categories:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-destructive font-medium">Error al cargar categorías</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <Button
                        onClick={() => fetchCategories()}
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
                    <h1 className="text-2xl font-bold text-foreground">Lista de Categorías</h1>
                    <p className="text-muted-foreground">
                        Gestiona las categorías del sistema
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
                            placeholder="Buscar categorías..."
                            value={globalFilter ?? ''}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="pl-9 w-64"
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="rounded-lg border border-sidebar-border bg-card">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-b border-sidebar-border">
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
                                                <span className="text-muted-foreground">Cargando categorías...</span>
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
                                        className="border-b border-sidebar-border transition-colors"
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
                                            <p className="text-muted-foreground">No se encontraron categorías</p>
                                            <p className="text-sm text-muted-foreground">
                                                {globalFilter ? 'Intenta ajustar tu búsqueda' : 'No hay categorías registradas'}
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
                                <span className="text-muted-foreground">Cargando categorías...</span>
                                <Spinner variant="ellipsis" className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    ) : table.getFilteredRowModel().rows?.length ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {table.getFilteredRowModel().rows.map((row) => {
                                const category = row.original;
                                return (
                                    <Card key={category.id} className="transition-shadow hover:shadow-md">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                                        <h3 className="font-mono font-medium text-muted-foreground">
                                                            {category.name.toUpperCase()}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <span>ID: {category.id}</span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                        category.active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {category.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <span className="text-sm text-muted-foreground">{category.description}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-2 border-t border-sidebar-border">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Creado: {formatDateTime(category.created_at)}</span>
                                                </div>
                                                {canEdit && (
                                                    <UserActions
                                                        category={category}
                                                        onEditCategory={handleEditCategory}
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
                                <p className="text-muted-foreground">No se encontraron categorías</p>
                                <p className="text-sm text-muted-foreground">
                                    {globalFilter ? 'Intenta ajustar tu búsqueda' : 'No hay categorías registradas'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isLoading && categories.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground !mb-6">
                    <div>
                        Mostrando {table.getFilteredRowModel().rows.length} de {categories.length} categoría(s)
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Total: {categories.length} categoría(s)</span>
                    </div>
                </div>
            )}

            <EditCategoryModal
                category={editingCategory}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onCategoryUpdated={handleCategoryUpdated}
            />
        </div>
    );
}
