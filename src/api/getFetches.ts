import instance from '../lib/axios';
import type { UserWithPermissions } from '../types/api';

export const getCurrentUser = (): Promise<UserWithPermissions> => {
    return instance.get('/user')
        .then((response) => response.data);
};