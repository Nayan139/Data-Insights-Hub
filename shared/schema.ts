import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const whatsappAccounts = pgTable("whatsapp_accounts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  businessAccountId: text("business_account_id").notNull(),
  accessToken: text("access_token").notNull(),
  verified: boolean("verified").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  status: text("status").default('draft'), // draft, processing, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  contactId: integer("contact_id").notNull(),
  status: text("status").default('pending'), // pending, sent, delivered, read, failed
  whatsappMessageId: text("whatsapp_message_id"),
  error: text("error"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
});

export const insertWhatsappAccountSchema = createInsertSchema(whatsappAccounts).omit({ id: true, userId: true, verified: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, userId: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, userId: true, status: true, createdAt: true }).extend({
  contactIds: z.array(z.number()).min(1, "Select at least one contact")
});

export type WhatsappAccount = typeof whatsappAccounts.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type CreateWhatsappAccountRequest = z.infer<typeof insertWhatsappAccountSchema>;
export type CreateContactRequest = z.infer<typeof insertContactSchema>;
export type CreateCampaignRequest = z.infer<typeof insertCampaignSchema>;

export type CampaignWithStats = Campaign & {
  totalMessages: number;
  sent: number;
  delivered: number;
  read: number;
};
