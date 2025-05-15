
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ListTodo, Calendar, DumbellIcon, User, X } from "lucide-react";
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
      icon: DumbellIcon,
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
          "fixed top-0 left-0 z-40 h-screen w-64 flex-shrink-0 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
          isMobile ? "transform" : "",
          isOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-xl text-primary">
            WellnessHub
          </Link>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-2 hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Sidebar content */}
        <div className="flex flex-col gap-2 p-4">
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
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
