// app/(auth)/register/RegisterForm.tsx
"use client";

import React, { useActionState, useId, useMemo, useState } from "react";
import { register } from "@/utils/auth/handlers/RegistrationHandler";
import FormSubmissionButton from "./FormSubmissionButton";
import { PasswordStrength } from "@/utils/auth/handlers/PasswordStrengthHandler";

type ActionErrors = Partial<
  Record<"email" | "password" | "confirmPassword" | "general", string>
>;
type ActionState =
  | { ok?: boolean; message?: string; errors?: ActionErrors }
  | undefined;

export default function RegisterForm() {
  const [state, registerAction] = useActionState<ActionState, FormData>(
    register,
    undefined
  );

  const emailId = useId();
  const pwId = useId();
  const cpwId = useId();
  const termsId = useId();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [clientErrors, setClientErrors] = useState<ActionErrors>({});

  function validateClient(): boolean {
    const errs: ActionErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email.";
    if (pw.length < 8) errs.password = "Use at least 8 characters.";
    if (pw !== cpw) errs.confirmPassword = "Passwords do not match.";
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!validateClient()) {
      e.preventDefault();
      return;
    }
  }

  const errors = state?.errors ?? clientErrors;

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">
            Create your NebulaVault account
          </h1>
          <p className="py-6">
            One login for web and Electron. Your files are encrypted end-to-end;
            you control the keys.
          </p>
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            {state?.message && (
              <div
                className={`alert ${
                  state?.ok ? "alert-success" : "alert-error"
                } mb-2`}
              >
                <span>{state.message}</span>
              </div>
            )}
            {errors?.general && (
              <div className="alert alert-error mb-2">
                <span>{errors.general}</span>
              </div>
            )}

            <form
              className="fieldset"
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
                aria-describedby={
                  errors?.email ? `${emailId}-error` : undefined
                }
              />
              {errors?.email && (
                <span
                  id={`${emailId}-error`}
                  className="label-text-alt text-error mt-1"
                >
                  {errors.email}
                </span>
              )}

              <div className="mt-3">
                <label htmlFor={pwId} className="label">
                  Password
                </label>
                <div className="join w-full">
                  <input
                    id={pwId}
                    name="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    className={`input input-bordered join-item w-full ${
                      errors?.password ? "input-error" : ""
                    }`}
                    placeholder="At least 8 characters"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                    aria-invalid={!!errors?.password}
                    aria-describedby={
                      errors?.password ? `${pwId}-error` : undefined
                    }
                  />
                  <button
                    type="button"
                    className="btn join-item"
                    onClick={() => setShowPw((v) => !v)}
                    aria-pressed={showPw}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                {errors?.password && (
                  <span
                    id={`${pwId}-error`}
                    className="label-text-alt text-error mt-1"
                  >
                    {errors.password}
                  </span>
                )}
                <PasswordStrength value={pw} />
                <p className="text-xs opacity-70 mt-1">
                  Tip: use a passphrase (e.g., four random words) for strong,
                  memorable security.
                </p>
              </div>

              <div className="mt-3">
                <label htmlFor={cpwId} className="label">
                  Confirm Password
                </label>
                <input
                  id={cpwId}
                  name="confirmPassword"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  className={`input input-bordered w-full ${
                    errors?.confirmPassword ? "input-error" : ""
                  }`}
                  placeholder="Re-enter your password"
                  value={cpw}
                  onChange={(e) => setCpw(e.target.value)}
                  required
                  aria-invalid={!!errors?.confirmPassword}
                  aria-describedby={
                    errors?.confirmPassword ? `${cpwId}-error` : undefined
                  }
                />
                {errors?.confirmPassword && (
                  <span
                    id={`${cpwId}-error`}
                    className="label-text-alt text-error mt-1"
                  >
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="form-control mt-4">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    id={termsId}
                    name="acceptTerms"
                    type="checkbox"
                    className="checkbox"
                    required
                  />
                  <span className="label-text">
                    I agree to the <a className="link link-hover">Terms</a> and{" "}
                    <a className="link link-hover">Privacy</a>.
                  </span>
                </label>
              </div>

              <FormSubmissionButton
                content="Create Account"
                altContent="Creating Account..."
              />

              <div className="mt-4 text-sm">
                <span className="opacity-70">Already have an account? </span>
                <a href="/login" className="link link-hover">
                  Sign in
                </a>
              </div>

              <input
                type="hidden"
                name="policy"
                value="minlen:8;upper;lower;digit;special:optional"
              />
            </form>

            {/* TODO: NOT SUPPORTED YET BUT WILL KEEP AS TODO FOR NOW*/}
            {/* 
            <div className="divider my-6">or</div>
            <div className="grid gap-2">
              <button
                className="btn btn-outline w-full"
                type="button"
                onClick={() => location.assign("/api/auth/oauth/google")}
              >
                Continue with Google
              </button>
              <button
                className="btn btn-outline w-full"
                type="button"
                onClick={() => location.assign("/api/auth/oauth/github")}
              >
                Continue with GitHub
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
