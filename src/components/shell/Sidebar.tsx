"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar } from "@/components/fx/Avatar";
import { ProgressBar } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { playerLevel } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { LogoMark, Wordmark } from "./Logo";
import { isActive, NAV } from "./nav";

function useNavShortcuts() {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable], [role=dialog]")) return;
      const item = NAV.find((n) => n.key === e.key);
      if (item) router.push(item.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}

export function Sidebar() {
  const pathname = usePathname();
  const game = useGame();
  const lvl = playerLevel(game);
  const setSettingsOpen = useUI((s) => s.setSettingsOpen);
  useNavShortcuts();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-abyss/80 backdrop-blur-xl lg:flex">
      <Link href="/" className="flex items-center gap-3 px-6 pb-8 pt-7" aria-label="ML QUEST home">
        <LogoMark size={26} />
        <Wordmark />
      </Link>

      <nav aria-label="Primary" className="flex-1 px-3">
        <div className="hud-label mb-3 px-3">Navigation</div>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const I = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] transition-colors",
                    active ? "text-ink" : "text-ink-muted hover:bg-white/[0.03] hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg border border-cyan/20 bg-cyan/[0.06]"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  {active && <span className="absolute -left-3 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_8px_#00E5FF]" />}
                  <I size={17} strokeWidth={1.7} className={cn("relative", active ? "text-cyan" : "text-ink-faint group-hover:text-ink-muted")} />
                  <span className="relative flex-1">{item.label}</span>
                  <kbd className="relative hidden font-mono text-[10px] text-ink-faint/70 group-hover:inline">{item.key}</kbd>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="m-3 rounded-xl border border-line bg-surface/60 p-3.5">
        <div className="flex items-center gap-3">
          <Avatar id={game.profile.avatarId} size={38} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-ink">{game.profile.username}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-cyan/80">Level {lvl.level}</div>
            <div className="truncate text-[11.5px] text-ink-muted">{lvl.title}</div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-white/5 hover:text-ink"
            aria-label="Settings"
          >
            <Settings size={15} />
          </button>
        </div>
        <div className="mt-3">
          <ProgressBar value={lvl.progress} height={4} label="Experience to next level" />
          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-faint">
            <span>{lvl.xp} XP</span>
            <span>{lvl.ceil} XP</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const game = useGame();
  const lvl = playerLevel(game);
  const setSettingsOpen = useUI((s) => s.setSettingsOpen);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-abyss/85 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2.5" aria-label="ML QUEST home">
          <LogoMark size={22} />
          <Wordmark className="text-[13px]" />
        </Link>
        <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-2" aria-label="Open settings">
          <span className="font-mono text-[11px] text-cyan">Lv {lvl.level}</span>
          <Avatar id={game.profile.avatarId} size={30} />
        </button>
      </header>
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-abyss/90 backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const I = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[10.5px]", active ? "text-cyan" : "text-ink-faint")}
                >
                  <I size={18} strokeWidth={1.7} />
                  {item.short}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
