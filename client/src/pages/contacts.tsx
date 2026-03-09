import { useState } from "react";
import { Layout } from "@/components/layout";
import { useContacts, useCreateContact, useDeleteContact } from "@/hooks/use-contacts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type CreateContactRequest } from "@shared/routes";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
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
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileSpreadsheet, Search, UserCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Contacts() {
  const { data: contacts, isLoading } = useContacts();
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const form = useForm<CreateContactRequest>({
    resolver: zodResolver(api.contacts.create.input),
    defaultValues: { name: "", phoneNumber: "" },
  });

  const onSubmit = (data: CreateContactRequest) => {
    createContact.mutate(data, {
      onSuccess: () => {
        toast({ title: "Contact added successfully" });
        setIsCreateOpen(false);
        form.reset();
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteContact.mutate(id, {
      onSuccess: () => toast({ title: "Contact deleted" }),
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  const filteredContacts = contacts?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phoneNumber.includes(search)
  ) || [];

  return (
    <Layout 
      title="Contacts" 
      description={`Manage your audience (${contacts?.length || 0} total)`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-card border-border/50 shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="h-11 rounded-xl bg-card border-border/50 shadow-sm" onClick={() => toast({ title: "Coming Soon", description: "Excel import will be available in the next update." })}>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
            Import CSV
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Enter the contact's details. Phone number must include country code.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="15551234567" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createContact.isPending} className="w-full h-11 rounded-xl mt-4">
                    {createContact.isPending ? "Saving..." : "Save Contact"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-lg shadow-black/5 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <UserCircle className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No contacts found</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {search ? "No contacts match your search query." : "You haven't added any contacts yet. Add your first contact to start sending messages."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Phone Number</TableHead>
                <TableHead className="font-semibold">Added On</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      {contact.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">+{contact.phoneNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.createdAt ? format(new Date(contact.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Are you sure you want to remove {contact.name}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(contact.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Layout>
  );
}
