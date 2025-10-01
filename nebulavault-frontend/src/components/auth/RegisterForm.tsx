"use client";

import React, { useActionState, useId, useState } from "react";
import { register } from "@/utils/auth/handlers/RegistrationHandler";
import FormSubmissionButton from "./FormSubmissionButton";

type ActionErrors = Partial<Record<"email" | "general", string>>;
type ActionState =
  | { ok?: boolean; message?: string; errors?: ActionErrors }
  | undefined;

export default function RegisterForm() {
  const [state, registerAction] = useActionState<ActionState, FormData>(
    register,
    undefined
  );

  const emailId = useId();
  const termsId = useId();
  const [email, setEmail] = useState("");
  const [clientErrors, setClientErrors] = useState<ActionErrors>({});

  function validateClient(): boolean {
    const errs: ActionErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email.";
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!validateClient()) e.preventDefault();
  }

  const errors = state?.errors ?? clientErrors;

  return (
    <div>
      {state?.message && (
        <div
          className={`alert ${state.ok ? "alert-success" : "alert-error"} mb-4`}
        >
          <span>{state.message}</span>
        </div>
      )}
      {errors?.general && (
        <div className="alert alert-error mb-4">
          <span>{errors.general}</span>
        </div>
      )}

      <form
        className="space-y-4"
        action={registerAction}
        onSubmit={onSubmit}
        noValidate
      >
        <label htmlFor={emailId} className="label">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          className={`input input-bordered w-full ${
            errors?.email ? "input-error" : ""
          }`}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={!!errors?.email}
          aria-describedby={errors?.email ? `${emailId}-error` : undefined}
        />
        {errors?.email && (
          <span
            id={`${emailId}-error`}
            className="label-text-alt text-error -mt-2"
          >
            {errors.email}
          </span>
        )}

        <div className="form-control pt-2">
          <label
            htmlFor={termsId}
            className="label cursor-pointer justify-start gap-3"
          >
            <input
              id={termsId}
              name="acceptTerms"
              type="checkbox"
              className="checkbox border-1 border-nv-primary"
              required
            />
            <span className="label-text">
              I agree to the <a className="link link-hover">Terms</a> and{" "}
              <a className="link link-hover">Privacy</a>.
            </span>
          </label>
        </div>

        <FormSubmissionButton
          content="Create account"
          altContent="Creating..."
        />

        <input
          type="hidden"
          name="policy"
          value="minlen:8;upper;lower;digit;special:optional"
        />
      </form>
    </div>
  );
}
