"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Lock, UploadCloud, Share2 } from "lucide-react";

const steps = [
  {
    icon: Lock,
    title: "Authenticate",
    text: "OIDC at the edge with JWT validation.",
  },
  {
    icon: UploadCloud,
    title: "Upload",
    text: "Direct, presigned S3 uploads with multipart.",
  },
  {
    icon: Share2,
    title: "Browse & share",
    text: "Gateway routes, previews, and permissions.",
  },
];

export default function Steps() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.h2
          className="text-center text-3xl sm:text-4xl font-bold text-nv-text mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          How it works
        </motion.h2>

        <div className="relative">
          <div className="hidden md:block absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-nv-primary/30 to-transparent" />

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                className="rounded-2xl border border-nv-border bg-nv-surface/60 p-6 backdrop-blur-sm shadow-card"
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl border border-nv-border bg-gradient-to-r from-nv-primary/15 to-nv-primary2/15">
                    <s.icon className="size-5 text-nv-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-nv-text">
                    {s.title}
                  </h3>
                </div>
                <p className="text-nv-muted">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
