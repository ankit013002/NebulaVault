"use client";

import React from "react";

// Colors
const BENZENE_BLUE = "#0052cc";
const BENZENE_BLUE_DIM = "rgba(0, 82, 204, 0.25)";
const BENZENE_BLUE_MID = "rgba(0, 82, 204, 0.55)";

interface BenzeneIconProps {
  size: number;
}

interface BenzeneWordmarkProps {
  iconSize?: number;
  showTagline?: boolean;
}

/**
 * BenzeneIcon - Animated hexagon logo with rotating outer ring
 * Features rotating ticks, counter-rotating inner circle, and pulsing vertex nodes
 */
function BenzeneIcon({ size }: BenzeneIconProps) {
  const cx = size / 2;
  const cy = size / 2;

  // Scale-relative dimensions
  const R = size * 0.36; // Hexagon radius
  const innerR = size * 0.195; // Inner circle radius
  const outerR = size * 0.48; // Outer ring radius
  const nodeR = size * 0.038; // Vertex node radius
  const tickLen = size * 0.055; // Tick length
  const sw = Math.max(0.6, size * 0.011); // Standard stroke width
  const swThin = Math.max(0.4, size * 0.007); // Thin stroke width
  const swFat = Math.max(0.9, size * 0.016); // Fat stroke width

  // Round to 2 decimals to prevent hydration mismatches
  const round = (n: number) => Math.round(n * 100) / 100;

  // Generate hexagon vertices
  const hex = (r: number, offset = 0) =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = ((i * 60 + offset) * Math.PI) / 180;
      return {
        x: round(cx + r * Math.cos(angle)),
        y: round(cy + r * Math.sin(angle)),
      };
    });

  const ring = hex(R, -90);
  const hexPath =
    ring.map((v, i) => `${i ? "L" : "M"}${v.x},${v.y}`).join("") + "Z";

  // Generate outer ring ticks
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const isMajor = i % 6 === 0;
    const r1 = outerR - (isMajor ? tickLen : tickLen * 0.55);
    const r2 = outerR;
    return {
      x1: round(cx + r1 * Math.cos(angle)),
      y1: round(cy + r1 * Math.sin(angle)),
      x2: round(cx + r2 * Math.cos(angle)),
      y2: round(cy + r2 * Math.sin(angle)),
      major: isMajor,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glowSoft" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={size * 0.14} />
        </filter>
      </defs>

      {/* Ambient aura */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR * 0.7}
        fill={BENZENE_BLUE}
        opacity="0.03"
        filter="url(#glowSoft)"
      />

      {/* Rotating outer ring with ticks */}
      <g
        className="bz-outer-ring"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          stroke={BENZENE_BLUE_DIM}
          strokeWidth={swThin}
        />
        {/* {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? BENZENE_BLUE_MID : BENZENE_BLUE_DIM}
            strokeWidth={t.major ? sw : swThin}
            strokeLinecap="round"
          />
        ))} */}
        {/* Shimmer arc */}
        <circle
          className="bz-shimmer-ring"
          cx={cx}
          cy={cy}
          r={outerR}
          stroke={BENZENE_BLUE}
          strokeWidth={sw * 1.2}
          strokeDasharray="40 160"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      {/* Hexagon */}
      <path
        d={hexPath}
        stroke={BENZENE_BLUE}
        strokeWidth={swFat}
        strokeLinejoin="round"
        className="bz-icon-hex"
      />
      {/* Hexagon fill glow */}

      {/* Inner aromatic circle — counter-rotating */}
      <g
        className="bz-inner-circle"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          stroke={BENZENE_BLUE}
          strokeWidth={swThin * 1.5}
          strokeDasharray={`${innerR * 0.35} ${innerR * 0.2}`}
        />
      </g>

      {/* Solid inner circle (non-rotating) */}
      {/* <circle
        cx={cx}
        cy={cy}
        r={innerR}
        stroke={BENZENE_BLUE}
        strokeWidth={sw * 0.9}
        opacity="0.85"
        filter="url(#glow)"
      /> */}

      {/* Vertex nodes */}
      {/* {ring.map((v, i) => (
        <g key={i}>
          <circle
            cx={v.x}
            cy={v.y}
            r={nodeR}
            fill={BENZENE_BLUE}
            opacity="0.08"
          />
          <circle
            cx={v.x}
            cy={v.y}
            r={nodeR}
            fill={BENZENE_BLUE}
            opacity="0.9"
            className="bz-glow-dot"
            style={{ animationDelay: `${i * 0.18}s` }}
            filter="url(#glow)"
          />
        </g>
      ))} */}

      {/* Center dot */}
      {/* <circle
        cx={cx}
        cy={cy}
        r={nodeR * 0.6}
        fill={BENZENE_BLUE}
        opacity="0.6"
      /> */}
    </svg>
  );
}

/**
 * BenzeneWordmark - Logo with animated icon and text
 * Scales responsively based on iconSize prop
 */
export function BenzeneWordmark({
  iconSize = 72,
  showTagline = false,
}: BenzeneWordmarkProps) {
  const gap = Math.round(iconSize * 0.24);
  const fontSize = Math.round(iconSize * 0.88);
  const taglineSize = Math.round(iconSize * 0.18);

  return (
    <div className="bz-root flex items-center gap-1 cursor:default">
      <div className="bz-icon">
        <BenzeneIcon size={iconSize} />
      </div>
      <div className="flex flex-col" style={{ gap }}>
        <span
          className="font-bold bz-wordmark text-gradient bg-gradient-to-r from-foreground to-bz-primary2"
          style={{
            fontFamily: "'Syne', system-ui, sans-serif",
            fontSize,
            lineHeight: 1,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Benzene
        </span>
        {showTagline && (
          <span
            style={{
              fontFamily: "'Syne', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: taglineSize,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(0, 82, 204, 0.5)",
            }}
          >
            Secure Storage
          </span>
        )}
      </div>
    </div>
  );
}

export default BenzeneIcon;
