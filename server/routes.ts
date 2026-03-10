import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated, registerAuthRoutes, setupAuth } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up auth middleware
  await setupAuth(app);

  // Register auth routes first
  registerAuthRoutes(app);

  // WhatsApp Account
  app.get(api.whatsappAccount.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const account = await storage.getWhatsappAccount(userId);
    res.json(account || null);
  });

  app.post(api.whatsappAccount.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.whatsappAccount.create.input.parse(req.body);

      // Check if user already has an account
      const existing = await storage.getWhatsappAccount(userId);
      if (existing) {
        return res.status(400).json({ message: "WhatsApp account already connected" });
      }

      // Validate with WhatsApp API
      const { verifyWhatsAppAccount } = await import("./validation/whatsapp");
      const verification = await verifyWhatsAppAccount(input.phoneNumber, input.accessToken);

      if (!verification.valid) {
        return res.status(400).json({
          message: verification.error || "Verification Failed",
          field: "whatsapp"
        });
      }

      const account = await storage.createWhatsappAccount(userId, input);
      res.status(201).json(account);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // CSV Import endpoint
  app.post("/api/contacts/import", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { csvContent } = req.body;

      if (!csvContent || typeof csvContent !== "string") {
        return res.status(400).json({ message: "CSV content is required" });
      }

      const { processCSVData } = await import("./validation/csv");
      const result = await processCSVData(csvContent);

      if (!result.success) {
        return res.status(400).json({
          message: "CSV validation failed",
          errors: result.errors
        });
      }

      // Import all contacts
      const importedContacts = [];
      for (const contact of result.contacts) {
        const created = await storage.createContact(userId, {
          name: contact.name,
          phoneNumber: contact.whatsappNumber
        });
        importedContacts.push({
          ...created,
          status: contact.status
        });
      }

      res.status(201).json({
        imported: importedContacts.length,
        skipped: result.skipped,
        contacts: importedContacts,
        errors: result.errors
      });
    } catch (err) {
      console.error("Import error:", err);
      res.status(500).json({ message: "Failed to import contacts" });
    }
  });

  // Contacts
  app.get(api.contacts.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const contacts = await storage.getContacts(userId);
    res.json(contacts);
  });

  app.post(api.contacts.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.contacts.create.input.parse(req.body);
      const contact = await storage.createContact(userId, input);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.contacts.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
       return res.status(400).json({ message: "Invalid contact ID" });
    }
    const success = await storage.deleteContact(id, userId);
    if (!success) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(204).send();
  });

  // Campaigns
  app.get(api.campaigns.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const campaigns = await storage.getCampaigns(userId);
    res.json(campaigns);
  });

  app.get(api.campaigns.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
       return res.status(400).json({ message: "Invalid campaign ID" });
    }
    const campaign = await storage.getCampaign(id, userId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const messages = await storage.getMessagesForCampaign(id);

    res.json({ campaign, messages });
  });

  app.post(api.campaigns.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Verify WhatsApp account exists
      const account = await storage.getWhatsappAccount(userId);
      if (!account) {
        return res.status(400).json({ message: "WhatsApp account must be connected first" });
      }

      const input = api.campaigns.create.input.parse(req.body);

      // Verify all contacts belong to user
      for (const contactId of input.contactIds) {
        const contact = await storage.getContact(contactId);
        if (!contact || contact.userId !== userId) {
          return res.status(400).json({ message: `Contact ID ${contactId} not found or invalid` });
        }
      }

      const campaign = await storage.createCampaign(userId, input);

      // In a real app, we would enqueue background jobs here to send messages
      // For this MVP, we will simulate sending in the background shortly after creation
      simulateSendingMessages(campaign.id);

      res.status(201).json(campaign);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Analytics
  app.get(api.analytics.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const analytics = await storage.getAnalytics(userId);
    res.json(analytics);
  });

  return httpServer;
}

// Helper to simulate background message sending for MVP
import { db as dbInstance } from "./db";
import { messages as messagesTable, campaigns as campaignsTable } from "@shared/schema";
import { eq } from "drizzle-orm";

function simulateSendingMessages(campaignId: number) {
  setTimeout(async () => {
    try {
      // Mark campaign as completed
      await dbInstance.update(campaignsTable)
        .set({ status: 'completed' })
        .where(eq(campaignsTable.id, campaignId));

      // Mark all messages as delivered
      await dbInstance.update(messagesTable)
        .set({
          status: 'delivered',
          deliveredAt: new Date(),
          whatsappMessageId: `wamid.HBgL${Math.random().toString(36).substring(2, 10)}`
        })
        .where(eq(messagesTable.campaignId, campaignId));

      // Simulate a few read receipts
      setTimeout(async () => {
        const msgs = await dbInstance.select().from(messagesTable).where(eq(messagesTable.campaignId, campaignId));
        if (msgs.length > 0) {
          // Read first half of messages
          for (let i = 0; i < Math.ceil(msgs.length / 2); i++) {
             await dbInstance.update(messagesTable)
              .set({ status: 'read', readAt: new Date() })
              .where(eq(messagesTable.id, msgs[i].id));
          }
        }
      }, 5000);

    } catch (e) {
      console.error("Simulation error", e);
    }
  }, 2000);
}
