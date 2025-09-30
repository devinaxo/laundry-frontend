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