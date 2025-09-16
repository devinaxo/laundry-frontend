import instance from '../lib/axios';

/**
 * User related DELETE API calls
 */

export const deleteUser = (userId: number): Promise<{ message: string }> => {
    return instance.delete(`/users/${userId}`)
        .then((response) => response.data);
};