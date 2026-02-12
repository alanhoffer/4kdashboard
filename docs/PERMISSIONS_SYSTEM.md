# Sistema de Permisos y Roles - 4K Dashboard

## 📋 Roles Disponibles

El sistema tiene dos niveles de roles:

### 1. `global_role` (Rol Global)
- **`superadmin`**: Acceso completo al sistema
- **`user`**: Usuario normal (puede ser admin o usuario dentro de su cliente)

### 2. `role` (Rol dentro del Cliente)
- **`admin`**: Administrador del cliente (solo si `global_role` es `user`)
- **`user`**: Usuario normal del cliente

## 🔐 Matriz de Permisos

| Permiso | Superadmin | Admin Cliente | Usuario Normal |
|---------|-----------|---------------|----------------|
| `view_all_clients` | ✅ | ❌ | ❌ |
| `manage_clients` | ✅ | ❌ | ❌ |
| `view_all_users` | ✅ | ✅* | ❌ |
| `manage_users` | ✅ | ✅* | ❌ |
| `manage_apps` | ✅ | ❌ | ❌ |
| `view_analytics` | ✅ | ✅ | ❌ |
| `manage_dealers` | ✅ | ❌ | ❌ |
| `upload_files` | ✅ | ✅ | ✅ |
| `view_orders` | ✅ | ✅ | ✅ |
| `view_transfers` | ✅ | ✅ | ✅ |

*Admin de Cliente solo puede ver/gestionar usuarios de su propio cliente

## 🛠️ Uso del Sistema de Permisos

### 1. Hook `usePermissions`

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { 
    isSuperadmin, 
    isAdmin, 
    isUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions 
  } = usePermissions();

  // Verificar si es superadmin
  if (isSuperadmin) {
    // Mostrar contenido solo para superadmin
  }

  // Verificar permiso específico
  if (hasPermission('manage_users')) {
    // Mostrar botón de gestionar usuarios
  }

  // Verificar múltiples permisos (cualquiera)
  if (hasAnyPermission(['view_analytics', 'manage_users'])) {
    // Mostrar si tiene alguno de estos permisos
  }

  // Verificar múltiples permisos (todos)
  if (hasAllPermissions(['upload_files', 'view_orders'])) {
    // Mostrar solo si tiene todos los permisos
  }
}
```

### 2. Componente `PermissionGate`

Renderiza contenido condicionalmente basado en permisos:

```tsx
import { PermissionGate } from '@/components/PermissionGate';

function MyComponent() {
  return (
    <div>
      {/* Solo visible para usuarios con permiso upload_files */}
      <PermissionGate permission="upload_files">
        <button>Subir Archivo</button>
      </PermissionGate>

      {/* Solo visible para superadmin */}
      <PermissionGate requireSuperadmin>
        <button>Gestionar Clientes</button>
      </PermissionGate>

      {/* Solo visible para admin o superadmin */}
      <PermissionGate requireAdmin>
        <button>Ver Analytics</button>
      </PermissionGate>

      {/* Con fallback personalizado */}
      <PermissionGate 
        permission="manage_users"
        fallback={<p>No tienes permisos para ver esto</p>}
      >
        <UserManagementPanel />
      </PermissionGate>

      {/* Múltiples permisos (cualquiera) */}
      <PermissionGate permissions={['view_analytics', 'manage_users']}>
        <AdminPanel />
      </PermissionGate>

      {/* Múltiples permisos (todos) */}
      <PermissionGate 
        permissions={['upload_files', 'view_orders']}
        requireAll
      >
        <FileOperationsPanel />
      </PermissionGate>
    </div>
  );
}
```

### 3. Rutas Protegidas con `ProtectedRoute`

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Ruta que requiere superadmin
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requireSuperadmin>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>

// Ruta que requiere admin o superadmin
<Route 
  path="/analytics" 
  element={
    <ProtectedRoute requireAdmin>
      <Analytics />
    </ProtectedRoute>
  } 
/>

// Ruta que requiere un permiso específico
<Route 
  path="/users" 
  element={
    <ProtectedRoute requirePermission="manage_users">
      <UserManagement />
    </ProtectedRoute>
  } 
/>

// Ruta que requiere múltiples permisos
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute 
      requirePermissions={['view_analytics', 'upload_files']}
      requireAllPermissions={true}
    >
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## 📝 Ejemplos de Uso en el Sidebar

El sidebar ya está configurado para mostrar/ocultar items según permisos:

```tsx
// Items base (todos los usuarios)
const baseMenuItems = [
  { title: 'Dealer Overview', icon: Server, href: '/' },
  { title: 'File Manager', icon: FolderOpen, href: '/files', permission: 'upload_files' },
];

// Items solo para Admin
const adminMenuItems = [
  { title: 'Analytics', icon: BarChart3, href: '/analytics', permission: 'view_analytics' },
];

// Items solo para Superadmin
const superadminMenuItems = [
  { title: 'Manage Clients', icon: Building2, href: '/clients', permission: 'manage_clients' },
  { title: 'Manage Users', icon: Users, href: '/users', permission: 'manage_users' },
];
```

## 🎯 Permisos Disponibles

### `view_all_clients`
- Ver lista de todos los clientes
- Solo: Superadmin

### `manage_clients`
- Crear, editar, eliminar clientes
- Solo: Superadmin

### `view_all_users`
- Ver lista de usuarios
- Superadmin: Ve todos los usuarios
- Admin Cliente: Ve solo usuarios de su cliente

### `manage_users`
- Crear, editar, eliminar usuarios
- Superadmin: Puede gestionar usuarios de cualquier cliente
- Admin Cliente: Solo puede gestionar usuarios de su cliente

### `manage_apps`
- Gestionar aplicaciones del sistema
- Solo: Superadmin

### `view_analytics`
- Ver analytics y reportes
- Superadmin: Ve analytics de todos los clientes
- Admin Cliente: Ve analytics de su cliente

### `manage_dealers`
- Gestionar dealers/servers
- Solo: Superadmin

### `upload_files`
- Subir archivos ORD/TRF
- Todos los usuarios autenticados

### `view_orders`
- Ver órdenes procesadas
- Todos los usuarios autenticados (filtrado por cliente)

### `view_transfers`
- Ver transferencias procesadas
- Todos los usuarios autenticados (filtrado por cliente)

## 🔄 Agregar Nuevos Permisos

1. Agregar el permiso al tipo `Permission` en `src/hooks/usePermissions.ts`:

```tsx
export type Permission = 
  | 'view_all_clients'
  | 'manage_clients'
  // ... otros permisos
  | 'nuevo_permiso'; // ← Agregar aquí
```

2. Actualizar la lógica de `hasPermission` según el rol:

```tsx
if (isAdmin) {
  const adminPermissions: Permission[] = [
    // ... permisos existentes
    'nuevo_permiso', // ← Agregar aquí si aplica
  ];
  return adminPermissions.includes(permission);
}
```

3. Usar el permiso en componentes:

```tsx
<PermissionGate permission="nuevo_permiso">
  <NuevoComponente />
</PermissionGate>
```

## ⚠️ Notas Importantes

1. **Superadmin siempre tiene acceso**: Si un usuario es `superadmin`, tiene todos los permisos automáticamente.

2. **Filtrado automático**: Los endpoints de la API filtran automáticamente por `client_id`. Un usuario normal solo verá datos de su cliente.

3. **Permisos en el frontend**: Los permisos en el frontend son solo para UX. La seguridad real está en el backend.

4. **Rutas protegidas**: Siempre protege las rutas con `ProtectedRoute` además de ocultar elementos del UI.
