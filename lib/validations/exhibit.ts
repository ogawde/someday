import { z } from "zod";
import { WING_DB_VALUES } from "@/lib/constants";

export const exhibitDraftSchema = z.object({
  title: z.string().min(1).max(200),
  wing: z.enum(WING_DB_VALUES),
  whatItWas: z.string().min(1).max(5000),
  whyItStopped: z.string().min(1).max(5000),
  whatItCouldHaveBeen: z.string().min(1).max(5000),
  openToCollaboration: z.boolean().default(false),
});

export const aiExhibitSchema = z.object({
  title: z.string(),
  wing: z.enum(WING_DB_VALUES),
  what_it_was: z.string(),
  why_it_stopped: z.string(),
  what_it_could_have_been: z.string(),
});

export const generateExhibitInputSchema = z.object({
  textDump: z.string().min(50).max(20000),
  wing: z.enum(WING_DB_VALUES).optional(),
});

export const publishExhibitSchema = exhibitDraftSchema.extend({
  links: z.array(z.string().url()).max(5).optional(),
  imageUrls: z.array(z.string().url()).max(5).optional(),
});

export const reportSchema = z.object({
  exhibitId: z.string(),
  reason: z.string().min(10).max(1000),
});

export const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(5000),
});
