"use client";

import React, { useActionState, useState } from "react";
import FormSubmissionButton from "./FormSubmissionButton";
import Link from "next/link";
import { login } from "@/utils/auth/handlers/LoginHandler";
import { ActionErrors, ActionState } from "@/types/AuthActionState";

const LoginForm = () => {
  const [state, loginAction] = useActionState<ActionState, FormData>(
    login,
    undefined
  );

  const [email, setEmail] = useState("");

  const [clientErrors, setClientErrors] = useState<ActionErrors>({});

  function validateClient(): boolean {
    console.log("VALIDATING");
    const errs: ActionErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email.";
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
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <form className="fieldset" action={loginAction} onSubmit={onSubmit}>
              <label className="label">Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                type="email"
                className="input"
                placeholder="Email"
              />
              {state?.errors && (
                <div className="label-text-alt text-error mt-1">
                  <span>{errors.general}</span>
                </div>
              )}
              <FormSubmissionButton
                content="Log In"
                altContent="Logging In..."
              />
            </form>
            <Link href="/register" className="btn btn-ghost">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
