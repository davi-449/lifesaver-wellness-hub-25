
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ListTodo, Calendar, Dumbbell, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
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

  // Mobile version
  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <aside 
          className={cn(
            "fixed top-0 left-0 h-full w-64 z-40 bg-background border-r transform transition-transform duration-300 ease-in-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/" className="text-xl font-semibold text-primary">
              WellnessHub
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="p-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t py-2 px-4 flex justify-around items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-md transition-transform hover:scale-110",
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          ))}
        </div>
      </>
    );
  }

  // Desktop version - now fixed (always shown)
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-background border-r z-10">
      <div className="flex items-center h-16 px-4 border-b">
        <Link to="/" className="text-xl font-semibold text-primary">
          WellnessHub
        </Link>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
