"use client";

import { motion } from "framer-motion";
import Startfield from "@/components/marketing/Startfield";
import GlowOrb from "@/components/marketing/Gloworb";
import { Shield, UploadCloud, GitBranch } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <section className="relative min-h-dvh flex items-center justify-center overflow-hidden">
      <Startfield density={0.00012} />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[900px] h-[900px] rounded-full opacity-25">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-nv-primary/25 via-nv-primary2/10 to-transparent blur-3xl animate-pulse-glow" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="flex items-center gap-3 mb-6">
              <GlowOrb size="md" />
              <div className="leading-tight">
                <div className="text-2xl font-extrabold tracking-tight text-nv-text">
                  NEBULA
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-nv-text">
                  VAULT
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-nv-text mb-3">{title}</h1>
            {subtitle && (
              <p className="text-nv-muted text-lg mb-8">{subtitle}</p>
            )}

            <div className="space-y-3">
              <FeatureRow
                icon={<Shield className="size-4 text-nv-primary" />}
                title="Zero-trust gateway"
                text="Edge token validation with least-privilege access."
              />
              <FeatureRow
                icon={<UploadCloud className="size-4 text-nv-primary" />}
                title="Blazing uploads"
                text="Direct multipart uploads to S3 with presigned URLs."
              />
              <FeatureRow
                icon={<GitBranch className="size-4 text-nv-primary" />}
                title="Versioning & previews"
                text="Automatic versions with rich previews for docs and images."
              />
            </div>

            <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-nv-primary/30 to-transparent" />
            <p className="mt-4 text-sm text-nv-muted">
              SSO-ready • E2E audit • OpenTelemetry
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="rounded-2xl border border-nv-border bg-nv-surface/70 backdrop-blur-xl shadow-card p-6 sm:p-8"
          >
            <div className="lg:hidden mb-6">
              <div className="flex items-center gap-3">
                <GlowOrb size="md" />
                <div className="text-lg font-bold text-nv-text">
                  Nebula Vault
                </div>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-nv-text">{title}</h1>
              {subtitle && <p className="text-nv-muted mt-1">{subtitle}</p>}
              <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-nv-primary/30 to-transparent" />
            </div>

            {children}

            {footer && <div className="mt-6">{footer}</div>}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl border border-nv-border bg-gradient-to-r from-nv-primary/15 to-nv-primary2/15">
        {icon}
      </div>
      <div>
        <div className="text-nv-text font-semibold">{title}</div>
        <div className="text-nv-muted text-sm">{text}</div>
      </div>
    </div>
  );
}
