
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";

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
      
      // On desktop the sidebar is always open
      // On mobile, it appears at the bottom
      if (mobile !== isMobile) {
        setSidebarOpen(!mobile);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} />
      <main className={cn(
        "flex-1 transition-all duration-300",
        isMobile 
          ? "p-4 pb-20" // Adds space at the bottom for mobile navigation
          : sidebarOpen 
            ? "p-6 ml-64" // Adds margin for the sidebar
            : "p-6 ml-16"  // Smaller space when sidebar is minimized
      )}>
        {children}
      </main>
    </div>
  );
}
