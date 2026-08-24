import { z } from "zod";

export const updatePreferenceSchema = z.object({
  enabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
});
export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>;
