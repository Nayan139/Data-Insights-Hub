import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateContactRequest, type Contact } from "@shared/routes";

export function useContacts(enabled: boolean = true) {
  return useQuery({
    queryKey: [api.contacts.list.path],
    queryFn: async () => {
      const res = await fetch(api.contacts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return (await res.json()) as Contact[];
    },
    enabled,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateContactRequest) => {
      const validated = api.contacts.create.input.parse(data);
      const res = await fetch(api.contacts.create.path, {
        method: api.contacts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create contact");
      }
      return (await res.json()) as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.contacts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.contacts.delete.path, { id });
      const res = await fetch(url, {
        method: api.contacts.delete.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete contact");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.contacts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
    },
  });
}
