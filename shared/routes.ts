import { z } from 'zod';
import {
  insertWhatsappAccountSchema,
  insertContactSchema,
  insertCampaignSchema,
  type WhatsappAccount,
  type Contact,
  type CampaignWithStats,
  type Campaign,
  type Message
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  whatsappAccount: {
    get: {
      method: 'GET' as const,
      path: '/api/whatsapp/account' as const,
      responses: {
        200: z.custom<WhatsappAccount | null>(),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/whatsapp/account' as const,
      input: insertWhatsappAccountSchema,
      responses: {
        201: z.custom<WhatsappAccount>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  contacts: {
    list: {
      method: 'GET' as const,
      path: '/api/contacts' as const,
      responses: {
        200: z.array(z.custom<Contact>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/contacts' as const,
      input: insertContactSchema,
      responses: {
        201: z.custom<Contact>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/contacts/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    }
  },
  campaigns: {
    list: {
      method: 'GET' as const,
      path: '/api/campaigns' as const,
      responses: {
        200: z.array(z.custom<CampaignWithStats>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/campaigns/:id' as const,
      responses: {
        200: z.custom<{ campaign: Campaign; messages: (Message & { contact: Contact })[] }>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/campaigns' as const,
      input: insertCampaignSchema,
      responses: {
        201: z.custom<Campaign>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics' as const,
      responses: {
        200: z.custom<{ totalContacts: number; totalCampaigns: number; messagesSent: number; messagesDelivered: number; messagesRead: number }>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
