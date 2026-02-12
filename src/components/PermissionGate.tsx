import { ReactNode } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  requireSuperadmin?: boolean;
  requireAdmin?: boolean;
}

/**
 * Componente para mostrar contenido condicionalmente basado en permisos
 */
export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  requireSuperadmin = false,
  requireAdmin = false,
}: PermissionGateProps) {
  const { isSuperadmin, isAdmin, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Verificar si requiere superadmin
  if (requireSuperadmin && !isSuperadmin) {
    return <>{fallback}</>;
  }

  // Verificar si requiere admin (admin de cliente o superadmin)
  if (requireAdmin && !isAdmin && !isSuperadmin) {
    return <>{fallback}</>;
  }

  // Verificar permiso único
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Verificar múltiples permisos
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
