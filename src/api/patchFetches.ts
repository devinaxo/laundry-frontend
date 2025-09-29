import instance from '../lib/axios';
import type { UserWithPermissions, Role, Client, Order } from '../types/api';

/**
 * User related PATCH API calls
 */

export const restoreUser = (userId: number): Promise<{ message: string }> => {
    return instance.patch(`/users/${userId}/restore`)
        .then((response) => response.data);
};

export const updateUser = (userId: number, userData: Partial<UserWithPermissions>): Promise<UserWithPermissions> => {
    return instance.patch(`/users/${userId}`, userData)
        .then((response) => response.data);
};

/**
 * Role related PATCH API calls
 */

export const updateRolePermissions = (roleId: number, permissions: number[]): Promise<Role> => {
    return instance.patch(`/roles/${roleId}/permissions`, { permissions })
        .then((response) => response.data.role);
};

/**
 * Client related PATCH API calls
 */

export const restoreClient = (clientId: number): Promise<{ message: string }> => {
    return instance.patch(`/clients/${clientId}/restore`)
        .then((response) => response.data);
};

export const updateClient = (clientId: number, clientData: Partial<Client>): Promise<Client> => {
    return instance.patch(`/clients/${clientId}`, clientData)
        .then((response) => response.data);
};

/**
 * Order related PATCH API calls
 */

export const updateOrderStatus = (orderId: number, status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'): Promise<{ success: boolean, message: string, data: Order }> => {
    return instance.patch(`/orders/${orderId}/status`, { status })
        .then((response) => response.data);
};

export const updateOrder = (orderId: number, orderData: {
    status?: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
    estimated_delivery_date?: string;
    actual_delivery_date?: string;
    notes?: string;
}): Promise<Order> => {
    return instance.patch(`/orders/${orderId}`, orderData)
        .then((response) => response.data);
};