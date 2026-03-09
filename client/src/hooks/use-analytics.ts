import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface AnalyticsData {
  totalContacts: number;
  totalCampaigns: number;
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
}

export function useAnalytics(enabled: boolean = true) {
  return useQuery({
    queryKey: [api.analytics.get.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return (await res.json()) as AnalyticsData;
    },
    enabled,
  });
}
