// Base interfaces
export interface Permission {
    id: number;
    name: string;
    displayName: string;
    description: string;
    created_at: string;
    updated_at: string;
    pivot: {
        role_id: number;
        permission_id: number;
    };
}

export interface Role {
    id: number;
    name: string;
    displayName: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role_id: number;
    active: boolean;
    role: Role;
}

export interface Client {
    id: number,
    forename: string,
    surname: string,
    phone: string,
    address: string,
    latitude: string,
    longitude: string,
    active: boolean,
    created_at: string,
    updated_at: string,
}

export interface DashboardData {
    orders_today: {
        count: number;
        increase_percentage: number;
        yesterday_count: number;
    };
    pending_orders: {
        count: number;
    };
    revenue: {
        today: {
            amount: number;
            formatted: string;
        };
        month: {
            amount: number;
            formatted: string;
        };
    };
    order_status_summary: {
        pending: number;
        in_progress: number;
        ready: number;
        total_today: number;
    };
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardData;
    meta: {
        date: string;
        month: string;
        timezone: string;
    };
}

// RecentOrder has the same structure as Order but we keep it as a type alias for clarity
export type RecentOrder = Order;

export interface RecentOrdersResponse {
    success: boolean;
    data: RecentOrder[];
}

export interface Category {
    id: number,
    name: string,
    active: boolean,
    description: string,
    created_at: string,
    updated_at: string,
}

export interface Subcategory {
    id: number;
    category_id: number;
    name: string;
    description: string;
    price: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    category: Category;
}

export interface OrderItem {
    id?: number;
    order_id?: number;
    subcategory_id: number;
    quantity: number;
    unit_price?: string;
    subtotal?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    subcategory?: Subcategory;
}

export interface Order {
    id: number;
    client_id: number;
    order_number: string;
    status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
    total: string;
    reception_date: string;
    estimated_delivery_date?: string;
    actual_delivery_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    client: Client;
    items: OrderItem[];
}

// Request interfaces
export interface LoginRequest {
    username: string;
    password: string;
}

export interface CreateUserRequest {
    name: string;
    username: string;
    email: string;
    password: string;
    role_id: number;
    active?: boolean;
}

export interface CreateClientRequest {
    forename: string;
    surname: string;
    phone: string;
    address: string;
    latitude: string;
    longitude: string;
    active?: boolean;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    active?: boolean;
}

export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
    active?: boolean;
}

export interface CreateSubcategoryRequest {
    category_id: number;
    name: string;
    description?: string;
    price: number;
    active?: boolean;
}

export interface UpdateSubcategoryRequest {
    category_id?: number;
    name?: string;
    description?: string;
    price?: number;
    active?: boolean;
}

export interface CreateOrderRequest {
    client_id: number;
    reception_date: string;
    estimated_delivery_date?: string;
    notes?: string;
    items: {
        subcategory_id: number;
        quantity: number;
        notes?: string;
    }[];
}

export interface ReplaceOrderRequest {
    client_id: number;
    reception_date: string;
    estimated_delivery_date?: string;
    status?: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
    actual_delivery_date?: string;
    notes?: string;
    items: {
        subcategory_id: number;
        quantity: number;
        notes?: string;
    }[];
}

export interface UpdateClientRequest {
    forename?: string;
    surname?: string;
    phone?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    active?: boolean;
}


// Response interfaces
export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface LogoutResponse {
    message: string;
}

// User response from getCurrentUser (includes permissions in role)
export interface UserWithPermissions extends Omit<User, 'role'> {
    role: Role & {
        permissions: Permission[];
    };
}

// Generic API error response
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

// Pagination interfaces
export interface PaginationLink {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface PaginatedClientRequest {
    search?: string;
    active?: boolean;
    per_page: number;
    page: number;
}

export interface PaginatedOrderRequest {
    search?: string;
    client_id?: number;
    status?: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
    fecha_desde?: string;
    fecha_hasta?: string;
    per_page: number;
    page: number;
}

export type PaginatedClientsResponse = PaginatedResponse<Client>;
export type PaginatedOrdersResponse = PaginatedResponse<Order>;

// Analytics interfaces
export interface OverviewMetrics {
    period: {
        start_date: string | null;
        end_date: string | null;
    };
    metrics: {
        total_orders: number;
        total_revenue: string;
        average_order_value: string;
        unique_clients: number;
        highest_order: string;
        lowest_order: string;
    };
    growth: {
        orders_growth_percentage: number | null;
        revenue_growth_percentage: number | null;
    };
}

export interface MonthlyStats {
    period: {
        year: number;
        month: number;
        month_name: string;
        start_date: string;
        end_date: string;
    };
    stats: {
        total_orders: number;
        total_revenue: string;
        average_order_value: string;
        unique_clients: number;
    };
    status_breakdown: Array<{
        status: string;
        count: number;
    }>;
}

export interface OrdersPerMonth {
    year: number;
    data: Array<{
        month: number;
        month_name: string;
        month_short: string;
        total_orders: number;
        total_revenue: string;
        average_order_value: string;
    }>;
}

export interface YearlyComparison {
    years: number[];
    comparison: Array<{
        year: number;
        total_orders: number;
        total_revenue: string;
        average_order_value: string;
    }>;
    growth?: {
        orders_growth_percentage: number;
        revenue_growth_percentage: number;
        average_value_growth_percentage: number;
        from_year: string;
        to_year: string;
    };
}

export interface DailyStats {
    period: {
        start_date: string;
        end_date: string;
        total_days: number;
    };
    daily_data: Array<{
        date: string;
        day_name: string;
        total_orders: number;
        total_revenue: string;
        average_order_value: string;
    }>;
}

export interface TopClient {
    rank: number;
    client_id: number;
    client_name: string;
    phone: string;
    total_orders: number;
    total_spent: string;
    average_order_value: string;
    last_delivery_date: string;
}

export interface TopClientsResponse {
    limit: number;
    period: {
        start_date: string | null;
        end_date: string | null;
    };
    top_clients: TopClient[];
}

export interface FrequentClient {
    rank: number;
    client_id: number;
    client_name: string;
    phone: string;
    total_orders: number;
    total_spent: string;
    first_order_date: string;
    last_order_date: string;
    customer_since_days: number;
}

export interface FrequentClientsResponse {
    limit: number;
    period: {
        start_date: string | null;
        end_date: string | null;
    };
    frequent_clients: FrequentClient[];
}

export interface PopularService {
    rank: number;
    service_id: number;
    service_name: string;
    category_name: string;
    times_ordered: number;
    total_quantity: number;
    total_revenue: string;
}

export interface PopularServicesResponse {
    limit: number;
    period: {
        start_date: string | null;
        end_date: string | null;
    };
    popular_services: PopularService[];
}

export interface CategoryRevenue {
    category_id: number;
    category_name: string;
    total_items: number;
    total_revenue: string;
    average_item_value: string;
    percentage: number;
}

export interface CategoryRevenueResponse {
    period: {
        start_date: string | null;
        end_date: string | null;
    };
    total_revenue: string;
    categories: CategoryRevenue[];
}

export interface StatusDistribution {
    status: string;
    count: number;
    revenue: string;
    percentage: number;
}

export interface StatusDistributionResponse {
    period: {
        start_date: string | null;
        end_date: string | null;
    };
    total_orders: number;
    distribution: StatusDistribution[];
}