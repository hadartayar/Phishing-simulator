import { z } from "zod";

export const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export const recipientSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().default(""),
  department: z.string().optional().default(""),
});

export const campaignCreateSchema = z.object({
  name: z.string().min(1),
  templateId: z.number().int().positive(),
  recipientIds: z.array(z.number().int().positive()).min(1),
  scheduledAt: z.string().optional().nullable(),
});

export const campaignUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  templateId: z.number().int().positive().optional(),
  scheduledAt: z.string().optional().nullable(),
});
