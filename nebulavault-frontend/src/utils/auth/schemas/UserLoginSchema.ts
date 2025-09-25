import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long"),
});
export type LoginInput = z.infer<typeof loginSchema>;
