"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const gid = `logo-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00E5FF" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="none" stroke={`url(#${gid})`} strokeWidth="3" />
      <circle cx="32" cy="32" r="5" fill="#00E5FF" />
      <path d="M32 27 V14 M27.7 34.5 L17 40.5 M36.3 34.5 L47 40.5" stroke={`url(#${gid})`} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("display text-[15px] font-semibold tracking-[0.28em] text-ink", className)}>
      ML<span className="text-cyan">·</span>QUEST
    </span>
  );
}
