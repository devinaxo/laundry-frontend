import type { LucideIcon } from 'lucide-react';
import { Home, ClipboardList, Users, Package, Shirt, BarChart3, Settings, Plus, UserPlus, PackagePlus, ShirtIcon, FileText } from 'lucide-react';
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
const ReportsPage = lazy(() => import('@/pages/mock/ReportsPage'));
const CreateReportPage = lazy(() => import('@/pages/mock/CreateReportPage'));
const SettingsPage = lazy(() => import('@/pages/mock/SettingsPage'));
const UserManagementPage = lazy(() => import('@/pages/mock/UserManagementPage'));

// Mock perms
export const Permission = {
    // Dashboard
    VIEW_DASHBOARD: 'view_dashboard',
    
    // Orders
    VIEW_ORDERS: 'view_orders',
    CREATE_ORDER: 'create_order',
    EDIT_ORDER: 'edit_order',
    DELETE_ORDER: 'delete_order',
    
    // Customers
    VIEW_CUSTOMERS: 'view_customers',
    CREATE_CUSTOMER: 'create_customer',
    EDIT_CUSTOMER: 'edit_customer',
    DELETE_CUSTOMER: 'delete_customer',
    
    // Inventory
    VIEW_INVENTORY: 'view_inventory',
    CREATE_INVENTORY: 'create_inventory',
    EDIT_INVENTORY: 'edit_inventory',
    DELETE_INVENTORY: 'delete_inventory',
    
    // Services
    VIEW_SERVICES: 'view_services',
    CREATE_SERVICE: 'create_service',
    EDIT_SERVICE: 'edit_service',
    DELETE_SERVICE: 'delete_service',
    
    // Reports
    VIEW_REPORTS: 'view_reports',
    CREATE_REPORT: 'create_report',
    
    // Settings
    VIEW_SETTINGS: 'view_settings',
    MANAGE_USERS: 'manage_users',
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
        path: '/orders',
        component: OrdersPage,
        title: 'Orders',
        icon: ClipboardList,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_ORDERS],
        isParent: true,
        children: [
            {
                path: '/orders',
                component: OrdersPage,
                title: 'View Orders',
                icon: ClipboardList,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_ORDERS],
            },
            {
                path: '/orders/create',
                component: CreateOrderPage,
                title: 'Create Order',
                icon: Plus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_ORDER],
            },
        ],
    },
    {
        path: '/customers',
        component: CustomersPage,
        title: 'Customers',
        icon: Users,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_CUSTOMERS],
        isParent: true,
        children: [
            {
                path: '/customers',
                component: CustomersPage,
                title: 'View Customers',
                icon: Users,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_CUSTOMERS],
            },
            {
                path: '/customers/create',
                component: CreateCustomerPage,
                title: 'Add Customer',
                icon: UserPlus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_CUSTOMER],
            },
        ],
    },
    {
        path: '/inventory',
        component: InventoryPage,
        title: 'Inventory',
        icon: Package,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_INVENTORY],
        isParent: true,
        children: [
            {
                path: '/inventory',
                component: InventoryPage,
                title: 'View Inventory',
                icon: Package,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_INVENTORY],
            },
            {
                path: '/inventory/create',
                component: CreateInventoryPage,
                title: 'Add Item',
                icon: PackagePlus,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_INVENTORY],
            },
        ],
    },
    {
        path: '/services',
        component: ServicesPage,
        title: 'Services',
        icon: Shirt,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_SERVICES],
        isParent: true,
        children: [
            {
                path: '/services',
                component: ServicesPage,
                title: 'View Services',
                icon: Shirt,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_SERVICES],
            },
            {
                path: '/services/create',
                component: CreateServicePage,
                title: 'Add Service',
                icon: ShirtIcon,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_SERVICE],
            },
        ],
    },
    {
        path: '/reports',
        component: ReportsPage,
        title: 'Reports',
        icon: BarChart3,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_REPORTS],
        isParent: true,
        children: [
            {
                path: '/reports',
                component: ReportsPage,
                title: 'View Reports',
                icon: BarChart3,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_REPORTS],
            },
            {
                path: '/reports/create',
                component: CreateReportPage,
                title: 'Generate Report',
                icon: FileText,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.CREATE_REPORT],
            },
        ],
    },
    {
        path: '/settings',
        component: SettingsPage,
        title: 'Settings',
        icon: Settings,
        showInSidebar: true,
        requiresAuth: true,
        permissions: [Permission.VIEW_SETTINGS],
        isParent: true,
        children: [
            {
                path: '/settings',
                component: SettingsPage,
                title: 'General Settings',
                icon: Settings,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.VIEW_SETTINGS],
            },
            {
                path: '/settings/users',
                component: UserManagementPage,
                title: 'User Management',
                icon: Users,
                showInSidebar: true,
                requiresAuth: true,
                permissions: [Permission.MANAGE_USERS],
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