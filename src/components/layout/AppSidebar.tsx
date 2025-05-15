
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { 
  Calendar,
  LayoutDashboard, 
  List, 
  Dumbbell, 
  User, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ajuste automático ao alterar entre mobile e desktop
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  // Fechar o menu ao clicar em um item no mobile
  const handleNavigation = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

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
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}
      
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-30",
          isMobile ? (mobileOpen ? "block" : "hidden") : "hidden"
        )}
        onClick={() => setMobileOpen(false)}
      />
      
      <aside 
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border shadow-lg z-40 transition-transform duration-300 ease-in-out",
          collapsed && !isMobile ? "w-16" : "w-64",
          isMobile ? (mobileOpen ? "translate-x-0" : "translate-x-[-100%]") : "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 h-14 border-b">
          <h1 className={cn("text-xl font-bold text-primary transition-opacity duration-300", 
                           collapsed && !isMobile && "opacity-0")}>
            WellnessHub
          </h1>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          )}
        </div>
        
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-md transition-colors relative group",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={handleNavigation}
              end={item.path === "/"}
            >
              <item.icon className={cn("h-5 w-5", collapsed && !isMobile && "mx-auto")} />
              {(!collapsed || isMobile) && <span className="ml-3">{item.title}</span>}
              
              {/* Tooltip para menu colapsado */}
              {collapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.title}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
