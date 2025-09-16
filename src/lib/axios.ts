import axios from 'axios';

// Global variable to store session expired callback
let showSessionExpiredModal: (() => void) | null = null;

// Function to set the session expired callback
export const setSessionExpiredCallback = (callback: () => void) => {
    showSessionExpiredModal = callback;
};

// Create Axios instance with base configuration
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export const setAuthToken = (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
    delete api.defaults.headers.common['Authorization'];
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token && !config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const ignoredUrls = ['/login', '/logout'];

        const requestUrl = error.config?.url;
        const isIgnored = ignoredUrls.some(url => requestUrl?.startsWith(url));
        
        if (error.response?.status === 401 && !isIgnored) {
            if (error.config?.url?.includes('/logout')) {
                return Promise.reject(error);
            }
            
            // Clear authentication data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            removeAuthToken();
            
            // Show session expired modal if callback is available
            if (showSessionExpiredModal) {
                showSessionExpiredModal();
            } else {
                // Fallback to direct redirect if modal is not available
                window.location.href = '/login';
            }
            
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default api;