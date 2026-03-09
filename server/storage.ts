import { type User } from "@shared/models/auth";
import {
  type WhatsappAccount,
  type Contact,
  type Campaign,
  type Message,
  type CreateWhatsappAccountRequest,
  type CreateContactRequest,
  type CreateCampaignRequest,
  type CampaignWithStats,
  whatsappAccounts,
  contacts,
  campaigns,
  messages,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Whatsapp Account
  getWhatsappAccount(userId: string): Promise<WhatsappAccount | undefined>;
  createWhatsappAccount(userId: string, data: CreateWhatsappAccountRequest): Promise<WhatsappAccount>;

  // Contacts
  getContacts(userId: string): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(userId: string, data: CreateContactRequest): Promise<Contact>;
  deleteContact(id: number, userId: string): Promise<boolean>;

  // Campaigns
  getCampaigns(userId: string): Promise<CampaignWithStats[]>;
  getCampaign(id: number, userId: string): Promise<Campaign | undefined>;
  createCampaign(userId: string, data: CreateCampaignRequest): Promise<Campaign>;

  // Messages
  getMessagesForCampaign(campaignId: number): Promise<(Message & { contact: Contact })[]>;

  // Analytics
  getAnalytics(userId: string): Promise<{
    totalContacts: number;
    totalCampaigns: number;
    messagesSent: number;
    messagesDelivered: number;
    messagesRead: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getWhatsappAccount(userId: string): Promise<WhatsappAccount | undefined> {
    const [account] = await db.select().from(whatsappAccounts).where(eq(whatsappAccounts.userId, userId));
    return account;
  }

  async createWhatsappAccount(userId: string, data: CreateWhatsappAccountRequest): Promise<WhatsappAccount> {
    const [account] = await db.insert(whatsappAccounts).values({
      userId,
      ...data,
    }).returning();
    return account;
  }

  async getContacts(userId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.userId, userId)).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(userId: string, data: CreateContactRequest): Promise<Contact> {
    const [contact] = await db.insert(contacts).values({
      userId,
      ...data,
    }).returning();
    return contact;
  }

  async deleteContact(id: number, userId: string): Promise<boolean> {
    const [deleted] = await db.delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
      .returning();
    return !!deleted;
  }

  async getCampaigns(userId: string): Promise<CampaignWithStats[]> {
    const userCampaigns = await db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));

    const result: CampaignWithStats[] = [];

    for (const campaign of userCampaigns) {
      const campaignMessages = await db.select().from(messages).where(eq(messages.campaignId, campaign.id));

      result.push({
        ...campaign,
        totalMessages: campaignMessages.length,
        sent: campaignMessages.filter(m => m.status === 'sent' || m.status === 'delivered' || m.status === 'read').length,
        delivered: campaignMessages.filter(m => m.status === 'delivered' || m.status === 'read').length,
        read: campaignMessages.filter(m => m.status === 'read').length,
      });
    }

    return result;
  }

  async getCampaign(id: number, userId: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
    return campaign;
  }

  async createCampaign(userId: string, data: CreateCampaignRequest): Promise<Campaign> {
    // Start transaction
    return await db.transaction(async (tx) => {
      const [campaign] = await tx.insert(campaigns).values({
        userId,
        name: data.name,
        content: data.content,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        status: 'draft',
      }).returning();

      // Create messages for each contact
      if (data.contactIds && data.contactIds.length > 0) {
        const messagesData = data.contactIds.map(contactId => ({
          campaignId: campaign.id,
          contactId,
          status: 'pending',
        }));
        await tx.insert(messages).values(messagesData);
      }

      return campaign;
    });
  }

  async getMessagesForCampaign(campaignId: number): Promise<(Message & { contact: Contact })[]> {
    const results = await db.select({
      message: messages,
      contact: contacts
    })
    .from(messages)
    .innerJoin(contacts, eq(messages.contactId, contacts.id))
    .where(eq(messages.campaignId, campaignId));

    return results.map(r => ({
      ...r.message,
      contact: r.contact
    }));
  }

  async getAnalytics(userId: string) {
    const [{ count: contactsCount }] = await db.select({ count: sql<number>`cast(count(${contacts.id}) as integer)` }).from(contacts).where(eq(contacts.userId, userId));
    const [{ count: campaignsCount }] = await db.select({ count: sql<number>`cast(count(${campaigns.id}) as integer)` }).from(campaigns).where(eq(campaigns.userId, userId));

    // Get all messages for user's campaigns
    const userCampaigns = await db.select({ id: campaigns.id }).from(campaigns).where(eq(campaigns.userId, userId));
    const campaignIds = userCampaigns.map(c => c.id);

    let sent = 0;
    let delivered = 0;
    let read = 0;

    if (campaignIds.length > 0) {
      const allMessages = await db.select().from(messages).where(sql`${messages.campaignId} IN ${campaignIds}`);
      sent = allMessages.filter(m => m.status === 'sent' || m.status === 'delivered' || m.status === 'read').length;
      delivered = allMessages.filter(m => m.status === 'delivered' || m.status === 'read').length;
      read = allMessages.filter(m => m.status === 'read').length;
    }

    return {
      totalContacts: contactsCount || 0,
      totalCampaigns: campaignsCount || 0,
      messagesSent: sent,
      messagesDelivered: delivered,
      messagesRead: read,
    };
  }
}

export const storage = new DatabaseStorage();
