import instance from '../lib/axios';
import type { UserWithPermissions, Role, Permission } from '../types/api';

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