import instance from '../lib/axios';
import type { LoginRequest, LoginResponse, LogoutResponse, UserWithPermissions } from '../types/api';

/**
 * Auth related API POSTs
 */

export const postLogin = (username: string, password: string): Promise<LoginResponse> => {
    const loginData: LoginRequest = { username, password };
    return instance.post('/login', loginData)
        .then((response) => response.data);
};

export const postLogout = (): Promise<LogoutResponse> => {
    return instance.post('/logout')
        .then((response) => response.data);
};

/**
 * User related API POSTs
 */

export const deleteUser = (userId: number): Promise<{ message: string }> => {
    return instance.delete(`/users/${userId}`)
        .then((response) => response.data);
};

export const restoreUser = (userId: number): Promise<{ message: string }> => {
    return instance.patch(`/users/${userId}/restore`)
        .then((response) => response.data);
};

export const updateUser = (userId: number, userData: Partial<UserWithPermissions>): Promise<UserWithPermissions> => {
    return instance.put(`/users/${userId}`, userData)
        .then((response) => response.data);
};