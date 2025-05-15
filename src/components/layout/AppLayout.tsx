
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
      
      // No mobile, fechamos a sidebar lateralmente, 
      // mas ela aparecerá na parte inferior
      if (mobile !== isMobile) {
        setSidebarOpen(!mobile);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
      <main className={cn(
        "flex-1 transition-all duration-300",
        isMobile 
          ? "p-4 pb-20" // Adiciona espaço inferior para navegação móvel
          : sidebarOpen 
            ? "p-6 ml-64" // Adiciona margem para a sidebar
            : "p-6 ml-16"  // Espaço menor quando a sidebar está minimizada
      )}>
        {children}
      </main>
    </div>
  );
}
