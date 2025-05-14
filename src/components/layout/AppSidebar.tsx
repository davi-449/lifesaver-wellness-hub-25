
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar";
import { Calendar, LayoutDashboard, List, Dumbbell, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);

  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Tarefas",
      path: "/tasks",
      icon: List,
    },
    {
      title: "Agenda",
      path: "/calendar",
      icon: Calendar,
    },
    {
      title: "Fitness",
      path: "/fitness",
      icon: Dumbbell,
    },
    {
      title: "Perfil",
      path: "/profile",
      icon: User,
    },
  ];

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      )}
      <Sidebar 
        className={cn(
          "transition-all duration-300 ease-in-out", 
          collapsed && isMobile ? "translate-x-[-100%]" : "translate-x-0",
          isMobile && "fixed inset-y-0 left-0 z-40"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary">WellnessHub</h1>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          )}
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                          isActive 
                            ? "bg-sidebar-accent text-primary font-medium" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-primary"
                        )}
                        end={item.path === "/"}
                      >
                        <item.icon className="h-5 w-5" />
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
    </>
  );
}
