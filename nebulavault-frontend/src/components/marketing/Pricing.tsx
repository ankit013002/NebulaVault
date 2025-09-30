"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";

type Plan = {
  name: "Starter" | "Pro" | "Team";
  priceMonthly: number;
  priceYearly: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    priceMonthly: 0,
    priceYearly: 0,
    tagline: "For personal dev & testing.",
    features: ["100 MB storage", "Basic sharing", "Email support"],
  },
  {
    name: "Pro",
    priceMonthly: 8,
    priceYearly: 80,
    tagline: "For power users and creators.",
    features: ["50 GB storage", "Versioning & previews", "Priority support"],
    highlighted: true,
  },
  {
    name: "Team",
    priceMonthly: 15,
    priceYearly: 150,
    tagline: "For small teams who ship fast.",
    features: [
      "200 GB storage",
      "Roles & permissions",
      "Audit logs & SSO-ready",
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const signup = `${process.env.NEXT_PUBLIC_GATEWAY_ORIGIN}/auth/oidc/start?screen_hint=signup`;

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-nv-text">
            Simple pricing
          </h2>
          <p className="text-nv-muted mt-2">
            Start free. Upgrade when you need more.
          </p>

          <div className="mt-6 inline-flex items-center rounded-full border border-nv-border bg-nv-surface/60 p-1">
            <button
              type="button"
              aria-pressed={!yearly}
              className={`relative px-4 py-2 rounded-full text-sm transition ${
                !yearly ? "text-nv-bg" : "text-nv-muted"
              }`}
              onClick={() => setYearly(false)}
            >
              <motion.span
                layout
                className={`absolute inset-0 rounded-full ${
                  !yearly
                    ? "bg-gradient-to-r from-nv-primary to-nv-primary2"
                    : ""
                }`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <span className="relative">Monthly</span>
            </button>
            <button
              type="button"
              aria-pressed={yearly}
              className={`relative px-4 py-2 rounded-full text-sm transition ${
                yearly ? "text-nv-bg" : "text-nv-muted"
              }`}
              onClick={() => setYearly(true)}
            >
              <motion.span
                layout
                className={`absolute inset-0 rounded-full ${
                  yearly
                    ? "bg-gradient-to-r from-nv-primary to-nv-primary2"
                    : ""
                }`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <span className="relative">Yearly</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => {
            const price = yearly ? p.priceYearly : p.priceMonthly;
            const unit = yearly ? "/yr" : "/mo";
            return (
              <motion.div
                key={p.name}
                className={`rounded-2xl border bg-nv-surface/60 backdrop-blur-sm p-6 shadow-card ${
                  p.highlighted ? "border-nv-primary/40" : "border-nv-border"
                }`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-nv-text">
                    {p.name}
                  </h3>
                  {p.highlighted && (
                    <span className="text-xs px-2 py-1 rounded-full border border-nv-border bg-nv-card/60 text-nv-muted">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-nv-muted mt-1">{p.tagline}</p>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-nv-text">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price !== 0 && (
                    <span className="text-nv-muted ml-1">{unit}</span>
                  )}
                </div>

                <ul className="mt-6 space-y-2">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-nv-muted"
                    >
                      <Check className="size-4 mt-0.5 text-nv-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={signup}
                  className={`mt-6 inline-flex w-full justify-center rounded-xl2 px-4 py-2 font-semibold transition
                    ${
                      p.highlighted
                        ? "bg-gradient-to-r from-nv-primary to-nv-primary2 text-nv-bg hover:shadow-glow-sm"
                        : "border border-nv-border text-nv-text hover:border-nv-primary/40"
                    }`}
                >
                  Get started
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
