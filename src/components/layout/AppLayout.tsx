
import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isMobile ? "px-4 pt-16 pb-4" : "p-6",
        isMobile ? "w-full" : (sidebarOpen ? "ml-64" : "ml-16")
      )}>
        {children}
      </main>
    </div>
  );
}
