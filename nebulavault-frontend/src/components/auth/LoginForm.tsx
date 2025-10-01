"use client";

import React, { useActionState, useState } from "react";
import FormSubmissionButton from "./FormSubmissionButton";
import { login } from "@/utils/auth/handlers/LoginHandler";
import { ActionErrors, ActionState } from "@/types/AuthActionState";

export default function LoginForm() {
  const [state, loginAction] = useActionState<ActionState, FormData>(
    login,
    undefined
  );
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
    if (!validateClient()) {
      e.preventDefault();
    }
  }

  const errors = state?.errors ?? clientErrors;

  return (
    <form
      className="space-y-4"
      action={loginAction}
      onSubmit={onSubmit}
      noValidate
    >
      <label className="label" htmlFor="login-email">
        Email
      </label>
      <input
        id="login-email"
        name="email"
        type="email"
        className={`input input-bordered w-full ${
          errors?.email ? "input-error" : ""
        }`}
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-invalid={!!errors?.email}
        aria-describedby={errors?.email ? "login-email-error" : undefined}
      />
      {errors?.email && (
        <span
          id="login-email-error"
          className="label-text-alt text-error -mt-2"
        >
          {errors.email}
        </span>
      )}

      {state?.errors?.general && (
        <div className="alert alert-error">
          <span>{state.errors.general}</span>
        </div>
      )}

      <FormSubmissionButton content="Sign in" altContent="Signing in..." />
    </form>
  );
}
