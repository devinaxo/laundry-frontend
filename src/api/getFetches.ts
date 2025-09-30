import instance from '../lib/axios';
import type { UserWithPermissions, Role, Permission, PaginatedClientsResponse, PaginatedClientRequest, PaginatedOrdersResponse, PaginatedOrderRequest, Category, Subcategory, Client, DashboardResponse, RecentOrdersResponse } from '../types/api';

/**
 * Auth related GET API calls
 */

export const getCurrentUser = (): Promise<UserWithPermissions> => {
    return instance.get('/currentUser')
        .then((response) => response.data);
};

/**
 * User related GET API calls
 */

export const getUsersList = (): Promise<UserWithPermissions[]> => {
    return instance.get('/users/all')
        .then((response) => response.data);
}

/**
 * Roles and permissions related GET API calls
 */

export const getRolesList = (): Promise<Role[]> => {
    return instance.get('/roles')
        .then((response) => response.data);
}

export const getPermissionsList = (): Promise<Permission[]> => {
    return instance.get('/permissions')
        .then((response) => response.data);
}

/**
 * Client related GET API calls
 */

export const getClientsPaginated = (params: PaginatedClientRequest): Promise<PaginatedClientsResponse> => {
    return instance.get('/clients/paginated', { params })
        .then((response) => response.data);
}

export const getClientsList = (): Promise<Client[]> => {
    return instance.get('/clients')
        .then((response) => response.data);
}

/**
 * Categories and Subcategories related GET API calls
 */

export const getCategoriesList = (): Promise<Category[]> => {
    return instance.get('/categories')
        .then((response) => response.data.data);
}

export const getSubcategoriesList = (categoryId?: number): Promise<Subcategory[]> => {
    const params = categoryId ? { category_id: categoryId } : {};
    return instance.get('/subcategories', { params })
        .then((response) => response.data.data);
}

/**
 * Order related GET API calls
 */

export const getOrdersPaginated = (params: PaginatedOrderRequest): Promise<PaginatedOrdersResponse> => {
    return instance.get('/orders/paginated', { params })
        .then((response) => response.data);
}

/**
 * Dashboard related GET API calls
 */

export const getDashboardData = (): Promise<DashboardResponse> => {
    return instance.get('/dashboard')
        .then((response) => response.data);
}

export const getRecentOrders = (): Promise<RecentOrdersResponse> => {
    return instance.get('/orders/recent')
        .then((response) => response.data);
}