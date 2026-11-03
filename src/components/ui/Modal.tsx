"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/** Open dialogs, innermost last — only the topmost one handles keys. */
const stack: object[] = [];

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: focus is moved inside on open, trapped while open,
 * restored on close; Escape closes (unless `dismissable` is false).
 */
export function Modal({
  open,
  onClose,
  children,
  label,
  variant = "center",
  className,
  dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
  variant?: "center" | "drawer" | "fullscreen";
  className?: string;
  dismissable?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const me = {};
    stack.push(me);
    restore.current = document.activeElement as HTMLElement;
    const t = setTimeout(() => {
      const el = ref.current?.querySelector<HTMLElement>("[data-autofocus]") ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== me) return;
      if (e.key === "Escape" && dismissable) {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === "Tab" && ref.current) {
        const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      stack.splice(stack.indexOf(me), 1);
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      if (!stack.length) document.body.style.overflow = prevOverflow === "hidden" ? "" : prevOverflow;
      restore.current?.focus?.();
    };
  }, [open, dismissable]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn("fixed inset-0 z-50 flex", variant === "drawer" ? "justify-end" : "items-center justify-center p-4")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-void/75 backdrop-blur-sm"
            onClick={dismissable ? onClose : undefined}
            aria-hidden="true"
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={cn(
              "relative z-10 outline-none",
              variant === "drawer" &&
                "h-full w-full max-w-[620px] overflow-y-auto border-l border-line bg-abyss/95 shadow-2xl backdrop-blur-xl",
              variant === "center" && "w-full max-w-lg",
              variant === "fullscreen" && "h-full w-full",
              className,
            )}
            initial={variant === "drawer" ? { x: 48, opacity: 0 } : { y: 16, scale: 0.98, opacity: 0 }}
            animate={variant === "drawer" ? { x: 0, opacity: 1 } : { y: 0, scale: 1, opacity: 1 }}
            exit={variant === "drawer" ? { x: 48, opacity: 0 } : { y: 8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
