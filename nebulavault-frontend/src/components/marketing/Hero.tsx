"use client";

import { motion } from "framer-motion";
import AnimatedStorageBar from "./AnimatedStorageBar";
import Starfield from "./Startfield";

export default function Hero() {
  const signUpUrl = `${process.env.NEXT_PUBLIC_GATEWAY_ORIGIN}/auth/oidc/start?screen_hint=signup`;
  const signInUrl = `${process.env.NEXT_PUBLIC_GATEWAY_ORIGIN}/auth/oidc/start?screen_hint=login`;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Starfield />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full opacity-20">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-nv-primary/20 via-nv-primary2/10 to-transparent blur-3xl animate-pulse-glow" />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-nv-text leading-tight mb-6">
            Your personal cloud,{" "}
            <span className="bg-gradient-to-r from-nv-primary via-nv-primary2 to-sky-400 bg-clip-text text-transparent">
              reimagined
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="text-lg sm:text-xl text-nv-muted max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Secure, blazing-fast personal cloud storage with versioning, sharing,
          and zero-trust architecture. Built for developers and teams who demand
          performance and control.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <motion.a
            href={signUpUrl}
            className="px-8 py-4 bg-gradient-to-r from-nv-primary to-nv-primary2 text-nv-bg font-semibold rounded-xl2 shadow-glow hover:shadow-glow text-lg min-w-[200px]"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            Get started free
          </motion.a>

          <motion.a
            href={signInUrl}
            className="px-8 py-4 bg-nv-surface/50 backdrop-blur-sm text-nv-text font-semibold rounded-xl2 border border-nv-border hover:bg-nv-surface/70 hover:border-nv-primary/30 transition-all duration-200 text-lg min-w-[200px]"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            Sign in
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <AnimatedStorageBar />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-nv-primary/40 rounded-full flex justify-center"
            animate={{
              boxShadow: [
                "0 0 0px rgba(45, 212, 191, 0.3)",
                "0 0 20px rgba(45, 212, 191, 0.3)",
                "0 0 0px rgba(45, 212, 191, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-3 bg-nv-primary rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
