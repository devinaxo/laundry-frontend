import instance from '../lib/axios';
import type { Client } from '../types/api';

export interface UpdateClientRequest {
    forename?: string;
    surname?: string;
    phone?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    active?: boolean;
}

export const updateClient = (id: number, data: UpdateClientRequest): Promise<Client> => {
    return instance.put(`/clients/${id}`, data)
        .then((response) => response.data);
};