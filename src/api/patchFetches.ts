import instance from '../lib/axios';
import type { UserWithPermissions, Role, Client } from '../types/api';

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