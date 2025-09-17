import instance from '../lib/axios';
import type { LoginRequest, LoginResponse, LogoutResponse, UserWithPermissions, CreateUserRequest, Client, CreateClientRequest } from '../types/api';

/**
 * Auth related POST API calls
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
 * User related POST API calls
 */

export const createUser = (userData: CreateUserRequest): Promise<UserWithPermissions> => {
    return instance.post('/users', userData)
        .then((response) => response.data);
};

/**
 * Client related POST API calls
 */

export const createClient = (clientData: CreateClientRequest): Promise<Client> => {
    return instance.post('/clients', clientData)
        .then((response) => response.data);
};