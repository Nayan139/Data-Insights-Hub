import { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function Layout({ children, title, description }: LayoutProps) {
  const { state } = useSidebar();
  
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Subtle background gradient overlay */}
        <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        
        <header className="flex-none flex items-center gap-4 px-6 h-16 border-b border-border/40 bg-background/80 backdrop-blur-sm z-10">
          <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-colors" />
          <div>
            {title && <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>}
            {description && <p className="text-xs text-muted-foreground hidden sm:block">{description}</p>}
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-0">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
