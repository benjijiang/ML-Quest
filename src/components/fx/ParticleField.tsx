"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * A quiet field of drifting particles with faint proximity links.
 * Low density, low opacity; renders a single static frame under reduced motion.
 */
export function ParticleField({
  className,
  density = 0.00005,
  color = "0,229,255",
  linkDistance = 120,
}: {
  className?: string;
  density?: number;
  color?: string;
  linkDistance?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    let pts: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(12, Math.min(90, Math.floor(w * h * density)));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.5 + 0.15,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDistance * linkDistance) {
            const o = (1 - Math.sqrt(d2) / linkDistance) * 0.08;
            ctx.strokeStyle = `rgba(${color},${o})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${color},${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = () => {
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    resize();
    if (reduce) draw();
    else raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw();
    });
    ro.observe(canvas);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce, density, color, linkDistance]);

  return <canvas ref={ref} className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden="true" />;
}
