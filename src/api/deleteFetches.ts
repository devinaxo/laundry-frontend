import instance from '../lib/axios';

/**
 * User related DELETE API calls
 */

export const deleteUser = (userId: number): Promise<{ message: string }> => {
    return instance.delete(`/users/${userId}`)
        .then((response) => response.data);
};

export const deleteClient = (clientId: number): Promise<{ message: string }> => {
    return instance.delete(`/clients/${clientId}`)
        .then((response) => response.data);
};

export const deletePaymentProof = (orderId: number): Promise<{ message: string }> => {
    return instance.delete(`/orders/${orderId}/payment-proof`)
        .then((response) => response.data);
};