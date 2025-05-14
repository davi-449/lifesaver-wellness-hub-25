
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className={cn(
          "flex-1 overflow-x-hidden",
          isMobile ? "px-4 pt-16 pb-4" : "p-6"
        )}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
