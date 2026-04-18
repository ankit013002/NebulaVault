"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const LOGOS = ["QUANTUM_CO", "VOID_TECH", "NEBULA_LOGISTICS"] as const;

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8" ref={ref}>
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Gradient-border wrapper — 1px gradient ring around the card */}
        <div className="p-px rounded-[2rem] bg-gradient-to-br from-bz-primary via-bz-primary2 to-sky-400 shadow-2xl shadow-bz-primary/20">
          <div className="bg-[#1e2a3d] text-white py-16 px-8 md:py-20 md:px-20 rounded-[1.95rem] flex flex-col items-center text-center space-y-8">
            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Ready to transcend?
            </h2>

            {/* Subtitle */}
            <p className="text-white/65 max-w-lg text-lg leading-relaxed">
              Join developers and teams who&apos;ve moved their critical files
              to NebulaVault. Start free — no credit card required.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
              <motion.a
                href="/register"
                className="px-10 py-4 bg-white text-bz-primary rounded-xl font-bold text-lg hover:bg-white/90 transition-all duration-200 active:scale-95"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Start Free Trial
              </motion.a>
              <motion.a
                href="#faq"
                className="px-10 py-4 border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-all duration-200 active:scale-95"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Talk to us
              </motion.a>
            </div>

            {/* Social proof logos */}
            <div className="pt-6 flex flex-wrap justify-center gap-8 opacity-30 grayscale">
              {LOGOS.map((name) => (
                <span key={name} className="font-bold text-xl tracking-widest">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
