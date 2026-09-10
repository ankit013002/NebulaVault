"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Users, GitBranch, RefreshCw } from "lucide-react";

export default function BentoFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Heading */}
        <motion.div
          className="mb-20 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-bz-text">
            Engineered for{" "}
            <span className="bg-gradient-to-r from-bz-primary to-bz-primary2 bg-clip-text text-transparent">
              Permanence
            </span>
          </h2>
          <p className="text-bz-muted max-w-2xl text-lg leading-relaxed">
            We&apos;ve rebuilt storage from the atomic level up. Benzene isn&apos;t
            just a place to store files — it&apos;s infrastructure that outlasts you.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:min-h-[600px]">
          {/* Row 1, Left (8 cols): Zero-Trust Gateway */}
          <motion.div
            className="md:col-span-8 rounded-3xl p-10 flex flex-col justify-between overflow-hidden relative group active:scale-[0.99] transition-transform bg-bz-surface border border-bz-border shadow-card"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <div className="relative z-10 space-y-4 max-w-md">
              <div className="w-12 h-12 rounded-xl bg-bz-primary/10 flex items-center justify-center">
                <Shield className="size-6 text-bz-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-bold text-bz-text">
                Zero-Trust Gateway
              </h3>
              <p className="text-bz-muted leading-relaxed">
                Every request passes through Spring Cloud Gateway with HS256
                JWT verification, per-route rate limiting, and least-privilege
                header injection. Your services never see unauthenticated
                traffic.
              </p>
            </div>

            {/* Abstract network visualization */}
            <div
              aria-hidden
              className="absolute right-0 bottom-0 w-1/2 h-48 opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none p-6"
            >
              <div className="relative w-full h-full">
                {/* Node grid */}
                {[
                  { x: "10%", y: "20%", size: 10, delay: 0 },
                  { x: "40%", y: "10%", size: 8, delay: 0.4 },
                  { x: "70%", y: "25%", size: 12, delay: 0.8 },
                  { x: "25%", y: "55%", size: 7, delay: 0.2 },
                  { x: "60%", y: "60%", size: 9, delay: 0.6 },
                  { x: "85%", y: "70%", size: 11, delay: 1.0 },
                  { x: "50%", y: "85%", size: 7, delay: 0.3 },
                ].map((n, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-bz-primary"
                    style={{
                      left: n.x,
                      top: n.y,
                      width: n.size,
                      height: n.size,
                    }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: n.delay,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Row 1, Right (4 cols): Collaboration */}
          <motion.div
            className="md:col-span-4 bg-bz-primary text-white rounded-3xl p-10 flex flex-col justify-between active:scale-[0.99] transition-transform"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.14 }}
          >
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <Users className="size-5 text-[#9cf0ff]" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold">Seamless Collaboration</h3>
              <p className="text-white/75 text-sm leading-relaxed">
                Granular ACL controls, time-limited share links, and real-time
                delta-syncing. Grant or revoke access to any file or folder
                instantly. No more conflict files, ever.
              </p>
            </div>
            <div className="flex -space-x-3 pt-8">
              {[
                "bg-foreground/70",
                "bg-foreground/50",
                "bg-foreground/30",
              ].map((c, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 border-bz-primary ${c}`}
                />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-bz-primary bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                +12
              </div>
            </div>
          </motion.div>

          {/* Row 2, Left (4 cols): Versioning */}
          <motion.div
            className="md:col-span-4 rounded-3xl p-10 flex flex-col gap-6 active:scale-[0.99] transition-transform bg-bz-card border border-bz-border shadow-card"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-11 h-11 rounded-xl bg-bz-primary/12 flex items-center justify-center">
              <GitBranch className="size-5 text-bz-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-bz-text">
                Version Everything
              </h3>
              <p className="text-bz-muted text-sm mt-2 leading-relaxed">
                Every upload is versioned automatically. Browse history,
                restore any state, and compare diffs — no re-indexing, no
                gaps, from 1 file to 100 million.
              </p>
            </div>
            {/* Mini bar chart */}
            <div
              aria-hidden
              className="mt-auto h-20 flex items-end gap-2"
            >
              {[0.22, 0.44, 0.66, 0.85, 1].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-lg bg-bz-primary"
                  style={{
                    height: `${h * 100}%`,
                    opacity: 0.18 + h * 0.82,
                    ...(i === 4 ? { animation: "pulse 2s ease-in-out infinite" } : {}),
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Row 2, Right (8 cols): Reliability */}
          <motion.div
            className="md:col-span-8 rounded-3xl p-10 flex items-center justify-between active:scale-[0.99] transition-transform bg-bz-surface border border-bz-border shadow-card"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.26 }}
          >
            <div className="max-w-md">
              <h3 className="text-2xl font-bold text-bz-text mb-4">
                99.9999% Reliability
              </h3>
              <p className="text-bz-muted text-sm leading-relaxed">
                Self-healing data clusters automatically detect and repair
                bit-rot before it ever affects your workflow. S3 object storage
                with 11 nines of durability backs every byte you upload.
              </p>
            </div>
            {/* SLA spinner */}
            <div
              aria-hidden
              className="hidden sm:flex flex-shrink-0 items-center justify-center"
            >
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 rounded-full border-[8px] border-bz-primary/15 flex items-center justify-center">
                  <RefreshCw
                    className="size-10 text-bz-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <div
                  className="absolute inset-[-1px] rounded-full border-[8px] border-bz-primary border-t-transparent"
                  style={{ animation: "spin 3s linear infinite" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
