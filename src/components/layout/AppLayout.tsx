
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
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
        "flex-1 transition-all duration-300",
        isMobile 
          ? "p-4 pb-20" // Add padding at bottom for mobile navigation
          : "p-6 ml-64" // Add margin for desktop sidebar
      )}>
        {children}
      </main>
    </div>
  );
}
