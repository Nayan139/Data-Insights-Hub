import { Button } from "@/components/ui/button";
import { MessageCircle, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Branding & Content */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12 text-primary-foreground">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[80px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-black/10 blur-[100px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white p-2.5 rounded-2xl shadow-lg">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight">WhatsMarket</span>
        </div>

        <div className="relative z-10 max-w-lg mt-20">
          <h1 className="text-5xl font-bold leading-[1.1] mb-6">
            Scale your business with automated WhatsApp campaigns.
          </h1>
          <p className="text-primary-foreground/80 text-lg mb-12 leading-relaxed">
            Reach your customers where they already are. Manage contacts, send bulk messages, and track delivery rates all in one beautiful dashboard.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium">Instant campaign deployment</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium">Official WhatsApp Cloud API integration</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium">Real-time delivery & read analytics</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} WhatsMarket Inc.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-0 right-0 w-full h-[300px] bg-primary/5 blur-[100px] -z-10 rounded-full" />
        
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="bg-primary/10 p-2.5 rounded-2xl">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-foreground">WhatsMarket</span>
            </div>
            
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-border/50 shadow-xl shadow-black/5">
            <div className="space-y-4">
              <Button 
                onClick={handleLogin}
                className="w-full h-14 text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                size="lg"
              >
                Log in with Replit
              </Button>
            </div>
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              By logging in, you agree to our{" "}
              <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
