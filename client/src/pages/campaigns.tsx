import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useCampaigns, useCreateCampaign } from "@/hooks/use-campaigns";
import { useContacts } from "@/hooks/use-contacts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type CreateCampaignRequest } from "@shared/routes";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Plus, Megaphone, ArrowRight, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Campaigns() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { data: contacts } = useContacts();
  const createCampaign = useCreateCampaign();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<CreateCampaignRequest>({
    resolver: zodResolver(api.campaigns.create.input),
    defaultValues: { name: "", content: "", contactIds: [] },
  });

  const onSubmit = (data: CreateCampaignRequest) => {
    createCampaign.mutate(data, {
      onSuccess: () => {
        toast({ title: "Campaign created and sending started" });
        setIsCreateOpen(false);
        form.reset();
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    });
  };

  const getStatusColor = (status: string | null) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200';
    }
  };

  return (
    <Layout 
      title="Campaigns" 
      description="Create and track bulk message broadcasts"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-72 hidden sm:block">
          {/* Placeholder for future campaign search */}
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Broadcast</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Summer Sale 2024" {...field} className="h-11 rounded-xl bg-muted/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Content (Template)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Hello! We have a special offer..." 
                          className="resize-none h-32 rounded-xl bg-muted/30" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">Must match an approved Meta template for first-touch messages.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Select Recipients</FormLabel>
                      </div>
                      <div className="border border-border/50 rounded-xl overflow-hidden bg-muted/10">
                        <ScrollArea className="h-[200px] w-full p-4">
                          {!contacts?.length ? (
                            <div className="text-sm text-muted-foreground text-center py-8">No contacts available.</div>
                          ) : (
                            <div className="space-y-3">
                              {contacts.map((contact) => (
                                <FormField
                                  key={contact.id}
                                  control={form.control}
                                  name="contactIds"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={contact.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(contact.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), contact.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== contact.id
                                                    )
                                                  )
                                            }}
                                            className="rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer flex flex-col">
                                          <span className="text-sm font-medium">{contact.name}</span>
                                          <span className="text-xs text-muted-foreground">+{contact.phoneNumber}</span>
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createCampaign.isPending} className="w-full h-12 text-base font-semibold rounded-xl mt-6">
                  {createCampaign.isPending ? "Processing..." : "Launch Campaign"}
                  {!createCampaign.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-lg shadow-black/5 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : !campaigns?.length ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-primary/10 p-5 rounded-full mb-4">
              <Megaphone className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground max-w-md mb-6 text-lg">
              Start reaching out to your audience by creating your first WhatsApp broadcast.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl h-12 px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Create First Campaign
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Campaign Name</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Progress</TableHead>
                <TableHead className="font-semibold text-center">Sent Date</TableHead>
                <TableHead className="text-right font-semibold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const progress = campaign.totalMessages > 0 ? Math.round((campaign.sent / campaign.totalMessages) * 100) : 0;
                
                return (
                  <TableRow key={campaign.id} className="group hover:bg-muted/30 transition-colors cursor-pointer">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-base">{campaign.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {campaign.content}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize border shadow-none ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">{campaign.sent} / {campaign.totalMessages}</span>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {campaign.createdAt ? format(new Date(campaign.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/campaigns/${campaign.id}`} className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </Layout>
  );
}
