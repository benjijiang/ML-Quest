"use client";

import { motion } from "framer-motion";
import { LogoMark } from "./Logo";

export function BootScreen() {
  return (
    <motion.div
      className="fixed inset-0 grid place-items-center bg-void"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-5">
        <LogoMark size={40} className="animate-pulse-soft" />
        <div className="hud-label">Initializing neural interface</div>
        <div className="h-px w-40 overflow-hidden bg-white/5">
          <div className="h-full w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-cyan to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}
