
import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
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
        isMobile ? "w-full" : "ml-16",
        !isMobile && sidebarOpen && "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}
