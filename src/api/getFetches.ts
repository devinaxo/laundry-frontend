import instance from '../lib/axios';
import type { 
    UserWithPermissions, 
    Role, 
    Permission, 
    PaginatedClientsResponse, 
    PaginatedClientRequest, 
    PaginatedOrdersResponse, 
    PaginatedOrderRequest, 
    Category, 
    Subcategory, 
    Client, 
    DashboardResponse, 
    RecentOrdersResponse,
    OverviewMetrics,
    MonthlyStats,
    OrdersPerMonth,
    YearlyComparison,
    DailyStats,
    TopClientsResponse,
    FrequentClientsResponse,
    PopularServicesResponse,
    CategoryRevenueResponse,
    StatusDistributionResponse
} from '../types/api';

/**
 * Auth related GET API calls
 */

export const getCurrentUser = (): Promise<UserWithPermissions> => {
    return instance.get('/currentUser')
        .then((response) => response.data);
};

/**
 * User related GET API calls
 */

export const getUsersList = (): Promise<UserWithPermissions[]> => {
    return instance.get('/users/all')
        .then((response) => response.data);
}

/**
 * Roles and permissions related GET API calls
 */

export const getRolesList = (): Promise<Role[]> => {
    return instance.get('/roles')
        .then((response) => response.data);
}

export const getPermissionsList = (): Promise<Permission[]> => {
    return instance.get('/permissions')
        .then((response) => response.data);
}

/**
 * Client related GET API calls
 */

export const getClientsPaginated = (params: PaginatedClientRequest): Promise<PaginatedClientsResponse> => {
    return instance.get('/clients/paginated', { params })
        .then((response) => response.data);
}

export const getClientsList = (): Promise<Client[]> => {
    return instance.get('/clients')
        .then((response) => response.data);
}

/**
 * Categories and Subcategories related GET API calls
 */

export const getCategoriesList = (): Promise<Category[]> => {
    return instance.get('/categories')
        .then((response) => response.data.data);
}

export const getSubcategoriesList = (categoryId?: number): Promise<Subcategory[]> => {
    const params = categoryId ? { category_id: categoryId } : {};
    return instance.get('/subcategories', { params })
        .then((response) => response.data.data);
}

/**
 * Order related GET API calls
 */

export const getOrdersPaginated = (params: PaginatedOrderRequest): Promise<PaginatedOrdersResponse> => {
    return instance.get('/orders/paginated', { params })
        .then((response) => response.data);
}

/**
 * Dashboard related GET API calls
 */

export const getDashboardData = (): Promise<DashboardResponse> => {
    return instance.get('/dashboard')
        .then((response) => response.data);
}

export const getRecentOrders = (): Promise<RecentOrdersResponse> => {
    return instance.get('/orders/recent')
        .then((response) => response.data);
}

/**
 * Analytics related GET API calls
 */

export const getOverview = (params?: { start_date?: string; end_date?: string }): Promise<OverviewMetrics> => {
    return instance.get('/analytics/overview', { params })
        .then((response) => response.data);
};

export const getMonthlyStats = (params?: { year?: number; month?: number }): Promise<MonthlyStats> => {
    return instance.get('/analytics/monthly-stats', { params })
        .then((response) => response.data);
};

export const getOrdersPerMonth = (params?: { year?: number }): Promise<OrdersPerMonth> => {
    return instance.get('/analytics/orders-per-month', { params })
        .then((response) => response.data);
};

export const getYearlyComparison = (params?: { years?: number[] }): Promise<YearlyComparison> => {
    return instance.get('/analytics/yearly-comparison', { params })
        .then((response) => response.data);
};

export const getDailyStats = (params?: { start_date?: string; end_date?: string }): Promise<DailyStats> => {
    return instance.get('/analytics/daily-stats', { params })
        .then((response) => response.data);
};

export const getTopClients = (params?: { limit?: number; start_date?: string; end_date?: string }): Promise<TopClientsResponse> => {
    return instance.get('/analytics/top-clients', { params })
        .then((response) => response.data);
};

export const getFrequentClients = (params?: { limit?: number; start_date?: string; end_date?: string }): Promise<FrequentClientsResponse> => {
    return instance.get('/analytics/frequent-clients', { params })
        .then((response) => response.data);
};

export const getPopularServices = (params?: { limit?: number; start_date?: string; end_date?: string }): Promise<PopularServicesResponse> => {
    return instance.get('/analytics/popular-services', { params })
        .then((response) => response.data);
};

export const getCategoryRevenue = (params?: { start_date?: string; end_date?: string }): Promise<CategoryRevenueResponse> => {
    return instance.get('/analytics/category-revenue', { params })
        .then((response) => response.data);
};

export const getStatusDistribution = (params?: { start_date?: string; end_date?: string }): Promise<StatusDistributionResponse> => {
    return instance.get('/analytics/status-distribution', { params })
        .then((response) => response.data);
};