"use server";

import "server-only";
import { z } from "zod";
import { registrationSchema } from "../schemas/RegistrationSchema";
import { ActionErrors, ActionState } from "@/types/AuthActionState";
import { redirect } from "next/navigation";

function zodToFieldErrors(err: z.ZodError): ActionErrors {
  const out: ActionErrors = {};
  for (const issue of err.issues) {
    const key = (issue.path[0] as keyof ActionErrors) ?? "general";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function register(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = Object.fromEntries(formData);

  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: zodToFieldErrors(parsed.error),
    };
  }

  const email = parsed.data.email;

  redirect(
    `${process.env.GATEWAY_ORIGIN}/auth/oidc/start` +
      `?screen_hint=signup&login_hint=${encodeURIComponent(email)}`
  );
}
