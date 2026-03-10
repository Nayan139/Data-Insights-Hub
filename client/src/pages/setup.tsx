import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type CreateWhatsappAccountRequest } from "@shared/routes";
import { useCreateWhatsappAccount } from "@/hooks/use-whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, ArrowRight, ShieldAlert } from "lucide-react";

export default function Setup() {
  const { toast } = useToast();
  const createAccount = useCreateWhatsappAccount();

  const form = useForm<CreateWhatsappAccountRequest>({
    resolver: zodResolver(api.whatsappAccount.create.input),
    defaultValues: {
      phoneNumber: "",
      businessAccountId: "",
      accessToken: "",
    },
  });

  const onSubmit = (data: CreateWhatsappAccountRequest) => {
    createAccount.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Account Linked Successfully!",
          description: "Your WhatsApp Cloud API account is now connected.",
        });
        // App.tsx router will automatically redirect to dashboard since waAccount is now populated
      },
      onError: (error: any) => {
        const errorMsg = error.message || "Verification Failed";
        
        // Map specific error messages to form fields
        if (errorMsg.includes("Invalid WhatsApp Number")) {
          form.setError("phoneNumber", { message: "Invalid WhatsApp Number" });
        } else if (errorMsg.includes("Invalid Token")) {
          form.setError("accessToken", { message: "Invalid or expired token" });
        } else if (errorMsg.includes("already connected")) {
          form.setError("phoneNumber", { message: "This WhatsApp account is already connected" });
        }
        
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: errorMsg,
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 shadow-inner">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Connect WhatsApp</h1>
          <p className="text-muted-foreground text-lg">Link your WhatsApp Cloud API credentials to get started.</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-6 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              API Credentials Required
            </CardTitle>
            <CardDescription>
              You need a Meta Developer account and a configured WhatsApp app to obtain these details.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">WhatsApp Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. 15551234567" 
                          {...field} 
                          className="bg-background h-12 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                        />
                      </FormControl>
                      <FormDescription>The number registered with your Cloud API.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Business Account ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Found in Meta App Dashboard" 
                          {...field} 
                          className="bg-background h-12 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Permanent Access Token</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="EAAL..." 
                          {...field} 
                          className="bg-background h-12 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription>Ensure you generate a permanent token, not a 24-hour temporary one.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={createAccount.isPending}
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {createAccount.isPending ? "Verifying..." : "Connect Account"}
                  {!createAccount.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
