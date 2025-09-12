import instance from '../lib/axios';
import type { LoginRequest, LoginResponse, LogoutResponse } from '../types/api';

export const postLogin = (username: string, password: string): Promise<LoginResponse> => {
    const loginData: LoginRequest = { username, password };
    return instance.post('/login', loginData)
        .then((response) => response.data);
};

export const postLogout = (): Promise<LogoutResponse> => {
    return instance.post('/logout')
        .then((response) => response.data);
};