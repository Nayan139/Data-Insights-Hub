import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCampaignRequest, type CampaignWithStats, type Campaign, type Message } from "@shared/routes";
import { type Contact } from "@shared/routes";

export function useCampaigns(enabled: boolean = true) {
  return useQuery({
    queryKey: [api.campaigns.list.path],
    queryFn: async () => {
      const res = await fetch(api.campaigns.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return (await res.json()) as CampaignWithStats[];
    },
    enabled,
  });
}

export function useCampaign(id: number) {
  return useQuery({
    queryKey: [api.campaigns.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch campaign details");
      return (await res.json()) as { campaign: Campaign; messages: (Message & { contact: Contact })[] };
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCampaignRequest) => {
      const validated = api.campaigns.create.input.parse(data);
      const res = await fetch(api.campaigns.create.path, {
        method: api.campaigns.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create campaign");
      }
      return (await res.json()) as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
    },
  });
}
