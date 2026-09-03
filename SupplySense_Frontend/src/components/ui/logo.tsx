"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
  theme?: "light" | "dark";
}

export function LogoIcon({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeMap = {
    sm: "h-7 w-7",
    md: "h-8.5 w-8.5",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };

  const svgSizeMap = {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
  };

  const px = svgSizeMap[size];

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#090D16] p-1.5 text-white shadow-md shadow-blue-950/20 ring-1 ring-white/15 transition-all duration-300 group-hover:shadow-blue-500/25 group-hover:scale-[1.02] ${sizeMap[size]} ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600/30 via-cyan-500/20 to-transparent opacity-60 blur-[2px]" />

      {/* High-tech Supply Chain AI Nexus SVG Emblem */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="ss-primary-grad" x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="ss-accent-grad" x1="28" y1="6" x2="6" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Top Supply Echelon Diamond */}
        <path
          d="M16 4L26 9.5V14.5L16 9L6 14.5V9.5L16 4Z"
          fill="url(#ss-primary-grad)"
          fillOpacity="0.95"
        />

        {/* Interlocking Intelligent S-Curve Flow (Left Node to Right Node) */}
        <path
          d="M6 16.5L14 12V17.5L8.5 20.5L6 19V16.5Z"
          fill="#38BDF8"
        />
        <path
          d="M26 15.5L18 20V14.5L23.5 11.5L26 13V15.5Z"
          fill="#818CF8"
        />

        {/* Bottom Logistics Foundation Prism */}
        <path
          d="M16 28L6 22.5V17.5L16 23L26 17.5V22.5L16 28Z"
          fill="url(#ss-accent-grad)"
          fillOpacity="0.95"
        />

        {/* Central Neural Pulse Core Node */}
        <circle cx="16" cy="16" r="2.5" fill="#FFFFFF" />
        <circle cx="16" cy="16" r="4.5" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="1 1.5" />
      </svg>
    </div>
  );
}

export function Logo({
  size = "md",
  showWordmark = true,
  className = "",
  wordmarkClassName = "",
  theme = "light",
}: LogoProps) {
  const fontSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const isDark = theme === "dark";

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon size={size} />

      {showWordmark && (
        <span
          className={`font-black tracking-tight ${fontSizes[size]} ${
            isDark ? "text-white" : "text-[#0F172A]"
          } ${wordmarkClassName}`}
        >
          SupplySense
        </span>
      )}
    </div>
  );
}
