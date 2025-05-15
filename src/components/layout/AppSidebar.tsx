
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ListTodo, Calendar, Dumbbell, User, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Run once on mount
    
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

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile toggle button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-20 p-2 rounded-md bg-background border"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Mobile overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <aside 
          className={cn(
            "fixed top-0 left-0 h-full w-64 z-40 bg-background border-r transform transition-transform duration-200 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/" className="text-xl font-semibold text-primary">
              WellnessHub
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
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
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <>
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-background border-r transition-all duration-200 ease-in-out z-10",
          isOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex items-center h-16 px-4 border-b">
          {isOpen ? (
            <Link to="/" className="text-xl font-semibold text-primary">
              WellnessHub
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <span className="font-bold text-primary text-xl">W</span>
            </div>
          )}
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
                  <item.icon className="h-5 w-5 min-w-5" />
                  {isOpen && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Desktop toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-20 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
