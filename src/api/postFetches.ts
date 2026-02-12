import instance from '../lib/axios';
import type { LoginRequest, LoginResponse, LogoutResponse, UserWithPermissions, CreateUserRequest, Client, CreateClientRequest, Category, CreateCategoryRequest, Subcategory, CreateSubcategoryRequest, Order, CreateOrderRequest } from '../types/api';

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

export const forgotPassword = (email: string): Promise<{ message: string }> => {
    return instance.post('/forgot-password', { email })
        .then((response) => response.data);
};

export const resetPassword = (
    token: string,
    email: string,
    password: string,
    password_confirmation: string
): Promise<{ message: string }> => {
    return instance.post('/reset-password', { 
        token, 
        email, 
        password, 
        password_confirmation 
    })
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

/**
 * Category related POST API calls
 */

export const createCategory = (categoryData: CreateCategoryRequest): Promise<Category> => {
    return instance.post('/categories', categoryData)
        .then((response) => response.data);
};

/**
 * Subcategory related POST API calls
 */

export const createSubcategory = (subcategoryData: CreateSubcategoryRequest): Promise<Subcategory> => {
    return instance.post('/subcategories', subcategoryData)
        .then((response) => response.data);
};

/**
 * Order related POST API calls
 */

export const createOrder = (orderData: CreateOrderRequest): Promise<Order> => {
    return instance.post('/orders', orderData)
        .then((response) => response.data);
};

export const uploadPaymentProof = (orderId: number, file: File, paymentType: 'cash' | 'transfer'): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('payment_proof', file);
    formData.append('payment_type', paymentType);
    
    return instance.post(`/orders/${orderId}/payment-proof`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
        .then((response) => response.data);
};