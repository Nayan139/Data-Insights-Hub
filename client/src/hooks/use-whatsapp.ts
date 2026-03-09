import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateWhatsappAccountRequest, type WhatsappAccount } from "@shared/routes";

export function useWhatsappAccount(enabled: boolean = true) {
  return useQuery({
    queryKey: [api.whatsappAccount.get.path],
    queryFn: async () => {
      const res = await fetch(api.whatsappAccount.get.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch WhatsApp account");
      const data = await res.json();
      return data as WhatsappAccount | null;
    },
    enabled,
  });
}

export function useCreateWhatsappAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWhatsappAccountRequest) => {
      const validated = api.whatsappAccount.create.input.parse(data);
      const res = await fetch(api.whatsappAccount.create.path, {
        method: api.whatsappAccount.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to link account");
      }
      
      return (await res.json()) as WhatsappAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.whatsappAccount.get.path] });
    },
  });
}
