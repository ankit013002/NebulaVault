"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  usedKB?: number;
  quotaMB?: number;
};

const COLORS = {
  textMuted: "rgba(255,255,255,0.65)",
  textMain: "rgba(255,255,255,0.95)",
  surface: "#171923",
  border: "#2a2d3a",
  primary: "#2DD4BF",
  primary2: "#22D3EE",
  glow: "rgba(34,211,238,0.35)",
  shimmer: "rgba(255,255,255,0.35)",
};

export default function AnimatedStorageBar({
  usedKB = 50.27,
  quotaMB = 100,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReduced = useReducedMotion();
  const [pct, setPct] = useState(0);

  const computedPct = useMemo(() => {
    const usedMB = usedKB / 1024;
    const raw = (usedMB / quotaMB) * 100;
    return Math.min(100, Math.max(raw, raw > 0 ? 0.4 : 0));
  }, [usedKB, quotaMB]);

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setPct(computedPct), 400);
      return () => clearTimeout(t);
    }
  }, [isInView, computedPct]);

  return (
    <motion.div
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 448,
        marginInline: "auto",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 14,
          color: COLORS.textMuted,
          marginBottom: 8,
        }}
      >
        <span>Storage Usage</span>
        <span>{quotaMB} MB</span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(pct.toFixed(2))}
        style={{
          position: "relative",
          height: 8,
          borderRadius: 9999,
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9999,
            background: `linear-gradient(90deg, ${COLORS.primary}1F, ${COLORS.primary2}1F)`,
          }}
        />

        <motion.div
          style={{
            position: "relative",
            height: "100%",
            borderRadius: 9999,
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primary2})`,
            boxShadow: `0 0 16px ${COLORS.glow}`,
            width: 0,
          }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : undefined}
          transition={
            prefersReduced
              ? { duration: 0.01 }
              : { duration: 1.2, ease: "easeOut", delay: 0.3 }
          }
        >
          {!prefersReduced && (
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 9999,
                background: `linear-gradient(90deg, transparent, ${COLORS.shimmer}, transparent)`,
                transform: "translateX(-100%)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            />
          )}
        </motion.div>
      </div>

      <motion.div
        style={{
          fontSize: 12,
          color: COLORS.textMuted,
          marginTop: 6,
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 1.1 }}
      >
        {usedKB.toFixed(2)} KB used
      </motion.div>
    </motion.div>
  );
}
