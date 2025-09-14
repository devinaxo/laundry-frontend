import type { LucideIcon } from 'lucide-react';
import { ClipboardList, Home, Key, Package, PackagePlus, Plus, UserCog, UserPlus, Users } from 'lucide-react';
import { lazy } from 'react';

// Lazy load components
const DashboardContent = lazy(() => import('@/pages/dashboard/DashboardContent'));
const OrdersPage = lazy(() => import('@/pages/mock/OrdersPage'));
const CreateOrderPage = lazy(() => import('@/pages/mock/CreateOrderPage'));
const CustomersPage = lazy(() => import('@/pages/mock/CustomersPage'));
const CreateCustomerPage = lazy(() => import('@/pages/mock/CreateCustomerPage'));
const InventoryPage = lazy(() => import('@/pages/mock/InventoryPage'));
const CreateInventoryPage = lazy(() => import('@/pages/mock/CreateInventoryPage'));
const ServicesPage = lazy(() => import('@/pages/mock/ServicesPage'));
const CreateServicePage = lazy(() => import('@/pages/mock/CreateServicePage'));
const SettingsPage = lazy(() => import('@/pages/mock/SettingsPage'));
const UserManagementPage = lazy(() => import('@/pages/mock/UserManagementPage'));

// Actual perms
export const Permission = {
    VIEW_DASHBOARD: 'viewDashboard',

    CREATE_USERS: 'createUser',
    VIEW_USERS: 'viewUser',
    EDIT_USERS: 'editUser',
    DELETE_USERS: 'deleteUser',

    CREATE_ROLES: 'createRole',
    VIEW_ROLES: 'viewRole',
    EDIT_ROLES: 'editRole',

    CREATE_PERMISSIONS: 'createPermission',
    VIEW_PERMISSIONS: 'viewPermission',
    EDIT_PERMISSIONS: 'editPermission',

    CREATE_CLIENTS: 'createClient',
    VIEW_CLIENTS: 'viewClient',
    EDIT_CLIENTS: 'editClient',
    DELETE_CLIENTS: 'deleteClient',

    CREATE_CATEGORIES: 'createCategory',
    VIEW_CATEGORIES: 'viewCategory',
    EDIT_CATEGORIES: 'editCategory',
    DELETE_CATEGORIES: 'deleteCategory',

    CREATE_SUBCATEGORIES: 'createSubcategory',
    VIEW_SUBCATEGORIES: 'viewSubcategory',
    EDIT_SUBCATEGORIES: 'editSubcategory',
    DELETE_SUBCATEGORIES: 'deleteSubcategory',

    CREATE_ORDERS: 'createOrder',
    VIEW_ORDERS: 'viewOrder',
    EDIT_ORDERS: 'editOrder',
    DELETE_ORDERS: 'deleteOrder',
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];

export interface RouteConfig {
    path: string;
    component: React.ComponentType;
    title: string;
    icon: LucideIcon;
    showInSidebar: boolean;
    requiresAuth: boolean;
    permissions: PermissionType[];
    children?: RouteConfig[];
    isParent?: boolean;
}

export const routes: RouteConfig[] = [
    {
        path: '/dashboard',
        component: DashboardContent,
        title: 'Dashboard',
        icon: Home,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_DASHBOARD],
    },
    {
        path: '/users',
        component: UserManagementPage,
        title: 'Usuarios',
        icon: Users,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_USERS],
        isParent: true,
        children: [
            {
                path: '/list',
                component: SettingsPage,
                title: 'Lista de usuarios',
                icon: Users,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_USERS],
            },
            {
                path: '/new',
                component: UserManagementPage,
                title: 'Crear usuario',
                icon: UserPlus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_USERS],
            },
        ],
    },
    {
        path: '/roles',
        component: ServicesPage,
        title: 'Roles',
        icon: UserCog,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_ROLES],
        isParent: true,
        children: [
            {
                path: '/list',
                component: ServicesPage,
                title: 'Ver roles',
                icon: UserCog,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_ROLES],
            },
            {
                path: '/create',
                component: CreateServicePage,
                title: 'Crear rol',
                icon: Plus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_ROLES],
            },
        ],
    },
    {
        path: '/permissions',
        component: ServicesPage,
        title: 'Permisos',
        icon: Key,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_PERMISSIONS],
        isParent: true,
        children: [
            {
                path: '/list',
                component: ServicesPage,
                title: 'Ver permisos',
                icon: Key,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_PERMISSIONS],
            },
            {
                path: '/create',
                component: CreateServicePage,
                title: 'Crear permiso',
                icon: Plus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_PERMISSIONS],
            },
        ],
    },
    {
        path: '/orders',
        component: OrdersPage,
        title: 'Órdenes',
        icon: ClipboardList,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_ORDERS],
        isParent: true,
        children: [
            {
                path: '/list',
                component: OrdersPage,
                title: 'Ver órdenes',
                icon: ClipboardList,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_ORDERS],
            },
            {
                path: '/new',
                component: CreateOrderPage,
                title: 'Crear órden',
                icon: Plus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_ORDERS],
            },
        ],
    },
    {
        path: '/clients',
        component: CustomersPage,
        title: 'Clientes',
        icon: Users,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_CLIENTS],
        isParent: true,
        children: [
            {
                path: '/list',
                component: CustomersPage,
                title: 'Ver clientes',
                icon: Users,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_CLIENTS],
            },
            {
                path: '/new',
                component: CreateCustomerPage,
                title: 'Agregar cliente',
                icon: UserPlus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_CLIENTS],
            },
        ],
    },
    {
        path: '/categories',
        component: InventoryPage,
        title: 'Categorías de Items',
        icon: Package,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_CATEGORIES],
        isParent: true,
        children: [
            {
                path: '/list',
                component: InventoryPage,
                title: 'Ver categorías',
                icon: Package,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_CATEGORIES],
            },
            {
                path: '/new',
                component: CreateInventoryPage,
                title: 'Agregar categoría',
                icon: PackagePlus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_CATEGORIES],
            },
        ],
    },
    {
        path: '/subcategories',
        component: InventoryPage,
        title: 'Subcategorías de Items',
        icon: Package,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_SUBCATEGORIES],
        isParent: true,
        children: [
            {
                path: '/list',
                component: InventoryPage,
                title: 'Ver subcategorías',
                icon: Package,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_SUBCATEGORIES],
            },
            {
                path: '/new',
                component: CreateInventoryPage,
                title: 'Agregar subcategoría',
                icon: PackagePlus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_SUBCATEGORIES],
            },
        ],
    },
];

export const getProtectedRoutes = () => routes.filter(route => route.requiresAuth);
export const getSidebarRoutes = () => routes.filter(route => route.showInSidebar);
export const getRouteByPath = (path: string) => routes.find(route => route.path === path);

export const getAllRoutes = (): RouteConfig[] => {
    const flatRoutes: RouteConfig[] = [];

    const addRoute = (route: RouteConfig) => {
        flatRoutes.push(route);
        if (route.children) {
            route.children.forEach(addRoute);
        }
    };

    routes.forEach(addRoute);
    return flatRoutes;
};