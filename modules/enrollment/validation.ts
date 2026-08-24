import { z } from "zod";

export const enrollSchema = z.object({
  cursusId: z.string().min(1),
});
export type EnrollInput = z.infer<typeof enrollSchema>;
