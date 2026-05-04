import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useWhatsappAccount } from "@/hooks/use-whatsapp";
import { Loader2 } from "lucide-react";

// Pages
import Login from "./pages/login";
import Setup from "./pages/setup";
import Dashboard from "./pages/dashboard";
import Contacts from "./pages/contacts";
import Campaigns from "./pages/campaigns";
import CampaignDetails from "./pages/campaign-details";
import NotFound from "./pages/not-found";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <h2 className="text-xl font-bold font-display animate-pulse">Loading Whatsup...</h2>
    </div>
  );
}

function ProtectedRouter() {
  const { user, isLoading: authLoading } = useAuth();
  // Only query WA account if user is authenticated
  const { data: waAccount, isLoading: waLoading } = useWhatsappAccount(!!user);
  if (authLoading || (user && waLoading)) {
    return <LoadingScreen />;
  }
  // Not logged in -> force login
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }
  // Logged in but no WhatsApp account linked -> force setup
  if (!waAccount) {
    return (
      <Switch>
        <Route path="/setup" component={Setup} />
        <Route>
          <Redirect to="/setup" />
        </Route>
      </Switch>
    );
  }
  // Authenticated & Setup Complete -> Main App
  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/campaigns/:id" component={CampaignDetails} />
        {/* If user hits login or setup while valid, send to dash */}
        <Route path="/login"><Redirect to="/" /></Route>
        <Route path="/setup"><Redirect to="/" /></Route>
        <Route component={NotFound} />
      </Switch>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ProtectedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
