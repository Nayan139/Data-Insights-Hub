import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  LogOut,
  MessageCircle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [location] = useLocation();
  const { logout, isLoggingOut, user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Contacts", href: "/contacts", icon: Users },
    { name: "Campaigns", href: "/campaigns", icon: MessageSquare },
  ];

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar">
      <SidebarContent>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight mb-6">
            <div className="bg-primary/10 p-2 rounded-xl">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            WhatsMarket
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.name}
                      className={`
                        transition-all duration-200 py-3 
                        ${isActive ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent'}
                      `}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-lg bg-secondary/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.firstName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => logout()}
          disabled={isLoggingOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
