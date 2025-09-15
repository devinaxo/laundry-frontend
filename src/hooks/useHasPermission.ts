import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getCurrentUser } from '@/api/getFetches';
import type { UserWithPermissions, Permission } from '@/types/api';

/**
 * Simple hook to check if the current user has a specific permission
 * @param permissionName - The name of the permission to check (e.g., 'edit-users')
 * @returns boolean indicating if user has the permission
 */
export const useHasPermission = (permissionName: string): boolean => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('useHasPermission must be used within an AuthProvider');
    }
    const { user } = authContext;

    if (!user) return false;

    if (user?.role?.permissions) {
        return user.role.permissions.some(
            (permission: Permission) => permission.name === permissionName
        );
    }

    // Fallback
    if (user.role?.name === 'admin') {
        return true;
    }

    // If no permissions are loaded, deny access
    return false;
};