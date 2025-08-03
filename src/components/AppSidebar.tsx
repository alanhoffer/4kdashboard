import React from 'react';
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
import { Server, BarChart3, Settings, Activity, FolderOpen } from 'lucide-react';

export function AppSidebar() {
  const location = useLocation();
  
  const menuItems = [
    { title: 'Server Overview', icon: Server, href: '/' },
    { title: 'File Manager', icon: FolderOpen, href: '/files' },
    { title: 'Analytics', icon: BarChart3, href: '/analytics' },
    { title: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Server Monitor</h1>
            <p className="text-xs text-blue-100">Real-time status</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
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
    </Sidebar>
  );
}