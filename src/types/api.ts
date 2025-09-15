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