import { useAuth } from '@/context/AuthContext';

export type Permission = 
  | 'view_all_clients'
  | 'manage_clients'
  | 'view_all_users'
  | 'manage_users'
  | 'manage_apps'
  | 'view_analytics'
  | 'manage_dealers'
  | 'upload_files'
  | 'view_orders'
  | 'view_transfers';

/**
 * Hook para verificar permisos basados en el rol del usuario
 */
export function usePermissions() {
  const { user } = useAuth();

  // Debug: log para ver qué está recibiendo
  if (user) {
    console.log('usePermissions - User data:', user);
    console.log('usePermissions - global_role:', user.global_role);
    console.log('usePermissions - role:', user.role);
  }

  // GLOBAL_ROLE: 'admin' = superadmin, 'user' = usuario normal
  // ROLE: 'admin' = admin de cliente, 'user' = usuario normal
  const isSuperadmin = user?.global_role === 'admin';
  const isAdmin = user?.role === 'admin' && user?.global_role === 'user';
  const isUser = user?.role === 'user' && user?.global_role === 'user';

  // Debug: log de los valores calculados
  if (user) {
    console.log('usePermissions - isSuperadmin:', isSuperadmin);
    console.log('usePermissions - isAdmin:', isAdmin);
    console.log('usePermissions - isUser:', isUser);
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    // Superadmin tiene todos los permisos
    if (isSuperadmin) return true;

    // Permisos para Admin de Cliente
    if (isAdmin) {
      const adminPermissions: Permission[] = [
        'view_all_users', // Solo usuarios de su cliente
        'manage_users', // Solo usuarios de su cliente
        'view_orders',
        'view_transfers',
        'upload_files',
        'view_analytics',
      ];
      return adminPermissions.includes(permission);
    }

    // Permisos para Usuario Normal
    if (isUser) {
      const userPermissions: Permission[] = [
        'view_orders',
        'view_transfers',
        'upload_files',
      ];
      return userPermissions.includes(permission);
    }

    return false;
  };

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    isSuperadmin,
    isAdmin,
    isUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    user,
  };
}
