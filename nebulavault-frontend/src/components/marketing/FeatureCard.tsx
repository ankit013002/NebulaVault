"use client";

import { MotionConfig, motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Zap,
  GitBranch,
  Share2,
  Activity,
  Shield,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Blazing uploads",
    description:
      "Direct-to-S3 presigned uploads with multipart support for speed and reliability.",
  },
  {
    icon: GitBranch,
    title: "Versioning & previews",
    description:
      "Automatic versions with rich previews for docs, images, and code.",
  },
  {
    icon: Share2,
    title: "Share & permissions",
    description:
      "Granular controls, time-limited links, and fine-grained access.",
  },
  {
    icon: Activity,
    title: "Audit & activity",
    description:
      "End-to-end audit trail with real-time activity feeds and logs.",
  },
  {
    icon: Shield,
    title: "Zero-trust gateway",
    description:
      "Edge token validation and least-privilege access across services.",
  },
  {
    icon: BarChart3,
    title: "Observability",
    description:
      "Built-in OpenTelemetry with traces, metrics, and performance insights.",
  },
];

const cardVariants = {
  rest: { y: 0, scale: 1, opacity: 1 },
  hover: { y: -6, scale: 1.02, opacity: 1 },
  press: { scale: 0.995 },
};

export default function FeatureCards() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-nv-text mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-nv-primary via-nv-primary2 to-sky-400 bg-clip-text text-transparent">
              performance
            </span>
          </h2>
          <p className="text-lg text-nv-muted max-w-2xl mx-auto">
            Enterprise-grade capabilities designed for modern teams.
          </p>
        </motion.div>

        <MotionConfig
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 26,
            mass: 0.8,
          }}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
                whileTap="press"
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
                }
                transition={{ delay: i * 0.05 }}
                className="
                  group relative rounded-2xl border border-nv-border bg-nv-surface/60
                  backdrop-blur-sm p-6 shadow-card
                  transform-gpu will-change-transform
                  cursor-pointer
                "
              >
                <div
                  className="
                    pointer-events-none absolute inset-0 rounded-2xl opacity-0
                    group-hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-r from-nv-primary/10 via-transparent to-nv-primary2/10
                  "
                  aria-hidden
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-xl p-2 bg-gradient-to-r from-nv-primary/15 to-nv-primary2/15 border border-nv-border">
                      <Icon className="size-5 text-nv-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-nv-text">
                      {title}
                    </h3>
                  </div>
                  <p className="text-nv-muted">{description}</p>
                  <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-nv-primary/20 to-transparent" />
                </div>
              </motion.div>
            ))}
          </div>
        </MotionConfig>
      </div>
    </section>
  );
}
