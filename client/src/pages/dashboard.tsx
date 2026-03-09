import { useAnalytics } from "@/hooks/use-analytics";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Send, CheckCircle2, BookOpen, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: analytics, isLoading } = useAnalytics();

  const statCards = [
    { title: "Total Contacts", value: analytics?.totalContacts || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Campaigns Sent", value: analytics?.totalCampaigns || 0, icon: Send, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Total Delivered", value: analytics?.messagesDelivered || 0, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
    { title: "Total Read", value: analytics?.messagesRead || 0, icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const chartData = analytics ? [
    { name: 'Sent', value: analytics.messagesSent, color: 'hsl(210 100% 50%)' }, // Blue
    { name: 'Delivered', value: analytics.messagesDelivered, color: 'hsl(142 71% 49%)' }, // Green
    { name: 'Read', value: analytics.messagesRead, color: 'hsl(35 100% 50%)' }, // Amber
  ] : [];

  if (isLoading) {
    return (
      <Layout title="Dashboard" description="Overview of your WhatsApp campaigns">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" description="Overview of your WhatsApp campaigns">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-none shadow-md shadow-black/5 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-lg shadow-black/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Message Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[350px]">
            {analytics?.messagesSent === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Send className="w-12 h-12 mb-4 opacity-20" />
                <p>No messages sent yet. Create a campaign to see data.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg shadow-black/5 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border/50 text-sm shadow-sm">
              <span className="font-semibold block text-primary mb-1">Verify Templates</span>
              Ensure your message templates are approved in Meta Dashboard before sending bulk campaigns.
            </div>
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border/50 text-sm shadow-sm">
              <span className="font-semibold block text-primary mb-1">Opt-ins Required</span>
              Only send messages to contacts who have explicitly opted in to receive WhatsApp communications.
            </div>
          </CardContent>
        </Card>
      </div>

    </Layout>
  );
}
