"use client";

import { login } from "@/utils/auth/handlers/LoginHandler";
import React, { useActionState } from "react";
import FormSubmissionButton from "./FormSubmissionButton";
import Link from "next/link";

const LoginForm = () => {
  const [state, loginAction] = useActionState(login, undefined);

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
            <form className="fieldset" action={loginAction}>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="Email"
              />
              {state?.errors && (
                <div className="label-text-alt text-error mt-1">
                  <span>{state.errors}</span>
                </div>
              )}
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                className="input"
                placeholder="Password"
              />
              <div>
                <a className="link link-hover">Forgot password?</a>
              </div>
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
