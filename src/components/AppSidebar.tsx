import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from "@/components/ui/sidebar";
import { Server, BarChart3, Hammer, Settings, FolderOpen, MessageCircle, Sun, Moon, FileSpreadsheet, Edit } from 'lucide-react';
import Logo from '../images/logo/logo.png';

export function AppSidebar() {
  const location = useLocation();

  // Estado para tema, inicializa según clase en html o preferencia del sistema
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) return true;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
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

  const menuItems = [
    { title: 'Server Overview', icon: Server, href: '/' },
    { title: 'File Manager', icon: FolderOpen, href: '/files' },
    { title: 'Transform Data', icon: FileSpreadsheet, href: '/transform' },
    { title: 'Manage Dealers', icon: Edit, href: '/manage-dealers' },
    { title: 'AI Assistant', icon: MessageCircle, href: '/ai-assistant' },
    { title: 'Analytics', icon: BarChart3, href: '/analytic' },
    { title: 'Settings', icon: Settings, href: '/settings' },
  ];

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
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-slate-100">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Botón toggle modo oscuro */}
      <div className="px-4 py-3 border-t border-slate-200 mt-auto bg-sidebar-background flex items-center justify-center gap-2 cursor-pointer select-none "
        onClick={toggleDarkMode}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') toggleDarkMode(); }}
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <>
            <Sun className="h-5 w-5 text-sidebar-background" />
            <span className="text-sm text-sidebar-background">Modo claro</span>
          </>
        ) : (
          <>
            <Moon className="h-5 w-5 text-slate-700" />
            <span className="text-sm text-slate-900">Modo oscuro</span>
          </>
        )}
      </div>
    </Sidebar>
  );
}
