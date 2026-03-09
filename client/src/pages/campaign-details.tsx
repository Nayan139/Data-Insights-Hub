import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useCampaign } from "@/hooks/use-campaigns";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare, Check, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCampaign(Number(id));

  if (isLoading) {
    return (
      <Layout>
        <div className="mb-6"><Skeleton className="h-10 w-32" /></div>
        <Skeleton className="h-48 w-full rounded-2xl mb-8" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Campaign not found</h2>
          <Button asChild className="mt-6 rounded-xl">
            <Link href="/campaigns">Back to Campaigns</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const { campaign, messages } = data;

  const stats = {
    total: messages.length,
    sent: messages.filter(m => ['sent', 'delivered', 'read'].includes(m.status || '')).length,
    delivered: messages.filter(m => ['delivered', 'read'].includes(m.status || '')).length,
    read: messages.filter(m => m.status === 'read').length,
    failed: messages.filter(m => m.status === 'failed').length,
  };

  const getStatusIcon = (status: string | null) => {
    switch(status) {
      case 'read': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'sent': return <Check className="w-4 h-4 text-muted-foreground" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <Layout 
      title="Campaign Overview" 
      description={`Detailed report for ${campaign.name}`}
    >
      <div className="mb-6">
        <Button variant="ghost" asChild className="hover:bg-primary/5 hover:text-primary -ml-4 rounded-xl">
          <Link href="/campaigns">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaigns
          </Link>
        </Button>
      </div>

      {/* Hero Card */}
      <Card className="border-border/50 shadow-lg shadow-black/5 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-wider text-xs">
                  {campaign.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {campaign.createdAt ? format(new Date(campaign.createdAt), 'MMMM d, yyyy - h:mm a') : ''}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{campaign.name}</h2>
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                <p className="text-foreground whitespace-pre-wrap font-medium">{campaign.content}</p>
              </div>
            </div>
            
            <div className="flex-none grid grid-cols-2 gap-4 bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-sm min-w-[300px]">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Recipients</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Sent Rate</p>
                <p className="text-2xl font-bold text-primary">{Math.round((stats.sent/stats.total)*100 || 0)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Delivered</p>
                <p className="text-2xl font-bold">{Math.round((stats.delivered/stats.total)*100 || 0)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Failed</p>
                <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        Message Status
      </h3>
      <div className="bg-card rounded-2xl border border-border/50 shadow-lg shadow-black/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold pl-6">Recipient</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Sent At</TableHead>
              <TableHead className="font-semibold">Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium pl-6">{message.contact.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">+{message.contact.phoneNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 capitalize font-medium text-sm">
                    {getStatusIcon(message.status)}
                    {message.status}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {message.sentAt ? format(new Date(message.sentAt), 'MMM d, h:mm a') : '-'}
                </TableCell>
                <TableCell className="text-sm text-destructive max-w-[200px] truncate">
                  {message.error || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
