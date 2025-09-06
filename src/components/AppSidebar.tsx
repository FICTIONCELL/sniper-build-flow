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
import { useTranslation } from "@/contexts/TranslationContext";

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

export function AppSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const collapsed = state === "collapsed";

  const menuItems = [
    { title: t('dashboard'), url: "/", icon: BarChart3 },
    { title: t('compactModeMenu'), url: "/compact", icon: LayoutGrid },
    { title: t('projects'), url: "/projects", icon: Building2 },
    { title: t('buildings'), url: "/buildings", icon: Layers3 },
    { title: t('reserves'), url: "/reserves", icon: AlertTriangle },
    { title: t('contractors'), url: "/contractors", icon: Users },
    { title: t('reserveResolution'), url: "/resolve-reserves", icon: CheckCircle },
    { title: t('receptions'), url: "/receptions", icon: ClipboardCheck },
    { title: t('tasks'), url: "/tasks", icon: FolderOpen },
    { title: t('planning'), url: "/planning", icon: Calendar },
    { title: t('categories'), url: "/categories", icon: Tags },
    { title: t('settings'), url: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation')}</SidebarGroupLabel>
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