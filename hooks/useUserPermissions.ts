// hooks/useUserPermissions.ts
import { usePermissions } from '../components/PermissionContext';

export function useUserPermissions() {
  const context = usePermissions();
  if (!context) {
    throw new Error('useUserPermissions must be used within a PermissionProvider');
  }
  return context;
}