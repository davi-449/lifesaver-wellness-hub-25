
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ListTodo, Calendar, Dumbbell, User, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isMobile, isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  
  const items = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      title: "Tarefas",
      href: "/tasks",
      icon: ListTodo,
    },
    {
      title: "Agenda",
      href: "/calendar",
      icon: Calendar,
    },
    {
      title: "Fitness",
      href: "/fitness",
      icon: Dumbbell,
    },
    {
      title: "Perfil",
      href: "/profile",
      icon: User,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen flex-shrink-0 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
          isMobile ? "w-[80%] max-w-64" : "w-64",
          isOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : "w-16"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className={cn(
            "flex items-center gap-2 font-semibold text-xl text-primary",
            !isOpen && !isMobile && "hidden"
          )}>
            WellnessHub
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className={cn(
              "rounded-md p-2 hover:bg-accent",
              (!isMobile && isOpen) && "hidden"
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex flex-col gap-2 p-4 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {(isOpen || !isMobile) && <span className={cn(!isOpen && !isMobile ? "hidden" : "block")}>{item.title}</span>}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Toggle button for desktop */}
      {!isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed left-4 bottom-4 z-50 rounded-full bg-primary p-2 text-primary-foreground shadow-md hover:bg-primary/90"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

// This is the component that should be imported in AppLayout.tsx
export const AppSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <Sidebar isMobile={isMobile} isOpen={isOpen} setIsOpen={setIsOpen} />;
};
