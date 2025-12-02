// lib/auth.ts
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from './session';

// Require authentication and optionally specific permissions
export async function requireAuth(requiredPermissions?: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth');
  }

  // If no specific permissions required, just ensure user is authenticated
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return user;
  }

  // Check if user has any of the required permissions
  const hasPermission = requiredPermissions.some(permission => 
    user.permissions.includes(permission) || 
    user.permissions.includes('ALL_ACCESS') ||  // Super admin has all permissions
    user.role?.toLowerCase().includes('super') ||  // Super roles have all permissions
    user.permissions.some((perm: string) => perm.toLowerCase().includes('admin')) // Admin roles often have broad permissions
  );

  if (!hasPermission) {
    redirect('/unauthorized');
  }

  return user;
}

// Check if user has a specific permission
export function hasPermission(user: any, permission: string): boolean {
  if (!user) return false;
  
  // Super admins have all permissions
  if (user.role?.toLowerCase().includes('super') || 
      user.permissions?.includes('ALL_ACCESS') ||
      user.permissions?.some((perm: string) => perm.toLowerCase().includes('admin'))) {
    return true;
  }
  
  return user.permissions?.includes(permission) || false;
}

// Check if user has any of the specified permissions
export function hasAnyPermission(user: any, permissions: string[]): boolean {
  if (!user) return false;
  if (!permissions || permissions.length === 0) return true;
  
  // Super admins have all permissions
  if (user.role?.toLowerCase().includes('super') || 
      user.permissions?.includes('ALL_ACCESS') ||
      user.permissions?.some((perm: string) => perm.toLowerCase().includes('admin'))) {
    return true;
  }
  
  return permissions.some(perm => user.permissions?.includes(perm));
}

// Check if user has all specified permissions
export function hasAllPermissions(user: any, permissions: string[]): boolean {
  if (!user) return false;
  if (!permissions || permissions.length === 0) return true;
  
  // Super admins have all permissions
  if (user.role?.toLowerCase().includes('super') || 
      user.permissions?.includes('ALL_ACCESS') ||
      user.permissions?.some((perm: string) => perm.toLowerCase().includes('admin'))) {
    return true;
  }
  
  return permissions.every(perm => user.permissions?.includes(perm));
}