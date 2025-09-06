import { 
  Building2, 
  Layers3, 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  Calendar, 
  BarChart3, 
  FolderOpen,
  ClipboardCheck,
  Tags,
  Settings,
  LayoutGrid
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Mode Compact", url: "/compact", icon: LayoutGrid },
  { title: "Projets", url: "/projects", icon: Building2 },
  { title: "Bâtiments", url: "/buildings", icon: Layers3 },
  { title: "Réserves", url: "/reserves", icon: AlertTriangle },
  { title: "Sous-traitants", url: "/contractors", icon: Users },
  { title: "Levée de Réserves", url: "/resolve-reserves", icon: CheckCircle },
  { title: "Réceptions", url: "/receptions", icon: ClipboardCheck },
  { title: "Tâches", url: "/tasks", icon: FolderOpen },
  { title: "Planning", url: "/planning", icon: Calendar },
  { title: "Catégories", url: "/categories", icon: Tags },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
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