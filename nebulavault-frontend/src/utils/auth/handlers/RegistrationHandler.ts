"use server";

import "server-only";
import { z } from "zod";
import { registrationSchema } from "../schemas/RegistrationSchema";
import { ActionErrors, ActionState } from "@/types/AuthActionState";

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

  console.log(parsed);

  return {
    ok: true,
    message: "Account created. Check your email to verify, then sign in.",
    errors: {},
  };
}
