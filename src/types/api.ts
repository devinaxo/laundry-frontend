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

export type PaginatedClientsResponse = PaginatedResponse<Client>;