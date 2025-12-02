// hooks/useAuth.ts
import { useRouter } from 'next/navigation';
import { useUserSession } from '../components/UserSessionContext';
import { useUserPermissions } from './useUserPermissions';

export function useAuth() {
  const { user, loading, login, logout, isAuthenticated } = useUserSession();
  const { hasPermissions, loading: permissionsLoading } = useUserPermissions();
  const router = useRouter();

  const checkAuthAndPermissions = (requiredPermissions: string[], anyPermission: boolean = false) => {
    if (!isAuthenticated) {
      router.push('/auth');
      return false;
    }
    
    if (requiredPermissions.length === 0) {
      return true;
    }
    
    return hasPermissions(requiredPermissions, anyPermission);
  };

  return {
    user,
    loading: loading || permissionsLoading,
    isAuthenticated,
    login,
    logout,
    hasPermissions: checkAuthAndPermissions,
    canAccess: (requiredPermissions: string[], anyPermission: boolean = false) => 
      checkAuthAndPermissions(requiredPermissions, anyPermission)
  };
}