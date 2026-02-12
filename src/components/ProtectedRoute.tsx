import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperadmin?: boolean;
  requireAdmin?: boolean;
  requirePermission?: Permission;
  requirePermissions?: Permission[];
  requireAllPermissions?: boolean;
}

export function ProtectedRoute({
  children,
  requireSuperadmin = false,
  requireAdmin = false,
  requirePermission,
  requirePermissions,
  requireAllPermissions = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const { isSuperadmin, isAdmin, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si requiere superadmin (GLOBAL_ROLE === 'admin')
  if (requireSuperadmin && !isSuperadmin) {
    return <Navigate to="/" replace />;
  }

  // Verificar si requiere admin (admin de cliente o superadmin)
  if (requireAdmin && !isAdmin && !isSuperadmin) {
    return <Navigate to="/" replace />;
  }

  // Verificar permiso único
  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to="/" replace />;
  }

  // Verificar múltiples permisos
  if (requirePermissions && requirePermissions.length > 0) {
    const hasAccess = requireAllPermissions
      ? hasAllPermissions(requirePermissions)
      : hasAnyPermission(requirePermissions);

    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

// Export default también para compatibilidad
export default ProtectedRoute;
