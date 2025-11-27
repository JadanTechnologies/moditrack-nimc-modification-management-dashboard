import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, History, FilePlus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/auth";
import { Button } from "./ui/button";
export function AppSidebar(): JSX.Element {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            M
          </div>
          <span className="text-lg font-semibold">ModiTrack</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/')}>
              <Link to="/"><LayoutDashboard /> <span>Dashboard</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/requests/new')}>
              <Link to="/requests/new"><FilePlus /> <span>Submit Request</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user?.role === 'Admin' && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/users')}>
                  <Link to="/users"><Users /> <span>User Management</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/audit')}>
                  <Link to="/audit"><History /> <span>Audit Trail</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
        <SidebarFooter className="p-4">
          <div className="text-center mb-4">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}