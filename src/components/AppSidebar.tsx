import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Server, BarChart3, Hammer, Settings, FolderOpen, MessageCircle, Sun, Moon, FileSpreadsheet, Edit, LogOut, User, Users, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import Logo from '../images/logo/logo.png';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isSuperadmin, isAdmin } = usePermissions();

  // Debug: mostrar información del usuario en consola
  React.useEffect(() => {
    if (user) {
      console.log('Current user in sidebar:', user);
      console.log('Is superadmin?', isSuperadmin);
      console.log('Is admin?', isAdmin);
    }
  }, [user, isSuperadmin, isAdmin]);

  // Estado para tema, inicializa según clase en html o preferencia del sistema
  const [isDark, setIsDark] = useState(() => {
    // if (typeof window !== 'undefined') {
    //   if (document.documentElement.classList.contains('dark')) return true;
    //   return window.matchMedia('(prefers-color-scheme: dark)').matches;
    // }
    return false;
  });


  // Cambia clase dark en html y guarda preferencia
  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // En mount, aplica preferencia guardada o sistema
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      // Sin guardado, usar sistema
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      }
    }
  }, []);

  // Items del menú base (visibles para todos los usuarios autenticados)
  const baseMenuItems = [
    { title: 'Dealer Overview', icon: Server, href: '/', permission: undefined },
    { title: 'File Manager', icon: FolderOpen, href: '/files', permission: 'upload_files' as const },
    { title: 'Transform Data', icon: FileSpreadsheet, href: '/transform', permission: 'upload_files' as const },
  ];

  // Items solo para Admin y Superadmin
  const adminMenuItems = [
    { title: 'Analytics', icon: BarChart3, href: '/analytics', permission: 'view_analytics' as const },
  ];

  // Items solo para Superadmin
  const superadminMenuItems = [
    { title: 'Manage Clients', icon: Building2, href: '/clients', permission: 'manage_clients' as const },
    { title: 'Manage Users', icon: Users, href: '/users', permission: 'manage_users' as const },
    { title: 'Manage Dealers', icon: Edit, href: '/manage-servers', permission: 'manage_dealers' as const },
  ];

  // Items para todos
  const commonMenuItems = [
    { title: 'Settings', icon: Settings, href: '/settings', permission: undefined },
  ];

  // Combinar items según permisos
  const menuItems = [
    ...baseMenuItems,
    ...(isAdmin || isSuperadmin ? adminMenuItems : []),
    ...(isSuperadmin ? superadminMenuItems : []),
    ...commonMenuItems,
  ].filter(Boolean); // Filtrar items undefined/null

  // Debug: log de items del menú
  useEffect(() => {
    console.log('Menu items:', menuItems.map(item => ({ title: item.title, permission: item.permission })));
  }, [menuItems]);

  return (
    <Sidebar className="flex flex-col border-r border-border h-full bg-sidebar-background text-sidebar-foreground">
      <SidebarHeader className="border-b border-border bg-gradient-to-r from-blue-600 to-purple-600 text-sidebar-primary-foreground">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="p-2 bg-white/50 rounded-lg">
            <img src={Logo} alt="Logo" className="h-8 w-16" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">4K Monitor</h1>
            <p className="text-xs text-blue-100">Real-time status</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-auto bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-medium">Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <PermissionGate
                  key={item.href}
                  permission={item.permission}
                  fallback={null}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                      <Link to={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-slate-100">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </PermissionGate>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 bg-sidebar-background">
        {/* Información del usuario */}
        {user && (
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-slate-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{user.email}</p>
                <p className="text-xs text-slate-500 truncate">
                  {user.client_name || 'Sistema'} • {
                    user.global_role === 'admin' 
                      ? 'Superadmin' 
                      : user.role === 'admin' 
                        ? 'Admin Cliente' 
                        : 'Usuario'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Botón toggle modo oscuro */}
        <div className="px-4 py-2 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer select-none flex-1"
            onClick={toggleDarkMode}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') toggleDarkMode(); }}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700">Modo claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700">Modo oscuro</span>
              </>
            )}
          </div>
          
          {/* Botón logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-slate-600 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
