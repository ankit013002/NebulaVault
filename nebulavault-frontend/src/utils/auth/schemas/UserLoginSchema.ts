import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
});
export type LoginInput = z.infer<typeof loginSchema>;
