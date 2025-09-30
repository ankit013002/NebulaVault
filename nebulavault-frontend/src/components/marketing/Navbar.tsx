"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import GlowOrb from "./Gloworb";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const signInUrl = `/login`;
  const signUpUrl = `/register`;

  return (
    <motion.nav
      aria-label="Primary"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-nv-surface/80 backdrop-blur-xl border-b border-nv-border shadow-card"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.a
            href="#"
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-nv-primary/40 rounded-md"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <GlowOrb size="md" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-nv-text leading-tight">
                NEBULA
              </span>
              <span className="text-lg font-bold text-nv-text leading-tight">
                VAULT
              </span>
            </div>
          </motion.a>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="text-nv-muted hover:text-nv-text transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-nv-primary/40 rounded-md"
                whileHover={{ y: -1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <motion.a
              href={signInUrl}
              className="text-nv-muted hover:text-nv-text transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-nv-primary/40 rounded-md"
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Sign in
            </motion.a>
            <motion.a
              href={signUpUrl}
              className="px-4 py-2 bg-gradient-to-r from-nv-primary to-nv-primary2 text-nv-bg font-semibold rounded-xl2 hover:shadow-glow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-nv-primary/40"
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Get started
            </motion.a>
          </div>

          <motion.button
            className="md:hidden text-nv-text p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-nv-primary/40"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            whileTap={{ scale: 0.95 }}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-controls="primary-mobile-menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="primary-mobile-menu"
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-3 bg-nv-surface/95 backdrop-blur-xl rounded-2xl mt-2 border border-nv-border">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-nv-muted hover:text-nv-text transition-colors duration-200 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-nv-primary/40"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-2 space-y-2">
                  <a
                    href={signInUrl}
                    className="block px-3 py-2 text-nv-muted hover:text-nv-text transition-colors duration-200 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-nv-primary/40"
                  >
                    Sign in
                  </a>
                  <a
                    href={signUpUrl}
                    className="block px-3 py-2 bg-gradient-to-r from-nv-primary to-nv-primary2 text-nv-bg font-semibold rounded-xl2 text-center focus:outline-none focus:ring-2 focus:ring-nv-primary/40"
                  >
                    Get started
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
