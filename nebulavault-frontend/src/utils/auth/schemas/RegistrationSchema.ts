import { z } from "zod";

export const registrationSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email."),
    password: z.string().trim().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().trim(),
    acceptTerms: z
      .string()
      .refine((v) => v === "on", "You must accept the terms."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
