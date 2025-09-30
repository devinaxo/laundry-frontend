import instance from '../lib/axios';
import type { Client, Category, UpdateCategoryRequest, UpdateClientRequest, Subcategory, UpdateSubcategoryRequest, Order, ReplaceOrderRequest } from '../types/api';

export const updateClient = (id: number, data: UpdateClientRequest): Promise<Client> => {
    return instance.put(`/clients/${id}`, data)
        .then((response) => response.data);
};

export const updateCategory = (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    return instance.put(`/categories/${id}`, data)
        .then((response) => response.data.data);
};

export const updateSubcategory = (id: number, data: UpdateSubcategoryRequest): Promise<Subcategory> => {
    return instance.put(`/subcategories/${id}`, data)
        .then((response) => response.data.data);
};

export const replaceOrder = (id: number, data: ReplaceOrderRequest): Promise<Order> => {
    return instance.put(`/orders/${id}/replace`, data)
        .then((response) => response.data.data);
};