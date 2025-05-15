
import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  Activity, 
  User, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface AppSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
}

export function AppSidebar({ sidebarOpen, setSidebarOpen, isMobile }: AppSidebarProps) {
  const location = useLocation();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  
  const menuItems = [
    { icon: <Home className="size-5" />, label: "Dashboard", to: "/" },
    { icon: <Calendar className="size-5" />, label: "Calendário", to: "/calendar" },
    { icon: <CheckSquare className="size-5" />, label: "Tarefas", to: "/tasks" },
    { icon: <Activity className="size-5" />, label: "Fitness", to: "/fitness" },
    { icon: <User className="size-5" />, label: "Perfil", to: "/profile" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <div
          className={cn(
            "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="flex items-center justify-between p-4">
            {sidebarOpen && (
              <h2 className="text-xl font-bold">WellnessHub</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto"
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <Tooltip key={item.to} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors",
                        isActive(item.to)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="mr-3 flex-shrink-0">{item.icon}</span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!sidebarOpen && (
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </nav>
          </div>
          
          <div className="border-t p-4">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left flex items-center px-3 py-2 text-sm font-medium",
                    "text-red-500 hover:bg-muted hover:text-red-600"
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 size-5" />
                  {sidebarOpen && <span>Sair</span>}
                </Button>
              </TooltipTrigger>
              {!sidebarOpen && (
                <TooltipContent side="right">
                  Sair
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      )}
      
      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t flex items-center justify-around py-2">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center p-2 text-xs",
                isActive(item.to)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <span>{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
