import { z } from 'zod';

export const releaseItemSchema = z.object({
  itemId: z.string().min(1, "itemId is required"),
  type: z.enum(['feature', 'fix', 'behaviour_change']).optional(),
  description: z.string().min(1, "description is required"),
  qaEvidence: z.string().optional(),
  userImpact: z.string().optional()
});

export const releaseSchema = z.object({
  version: z.string().min(1, "version is required"),
  title: z.string().min(1, "title is required"),
  status: z.enum(['draft', 'reviewing', 'approved', 'rejected']).optional(),
  items: z.array(releaseItemSchema).optional(),
  limitations: z.string().optional(),
  migrationNotes: z.string().optional(),
  affectedUsers: z.string().optional()
});