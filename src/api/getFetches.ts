import instance from '../lib/axios';
import type { UserWithPermissions } from '../types/api';

export const getCurrentUser = (): Promise<UserWithPermissions> => {
    return instance.get('/currentUser')
        .then((response) => response.data);
};

export const getUsersList = (): Promise<UserWithPermissions[]> => {
    return instance.get('/users/all')
        .then((response) => response.data);
}