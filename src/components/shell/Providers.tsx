"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useGame } from "@/lib/store";
import { BootScreen } from "./BootScreen";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { QuestDrawer } from "@/components/quest/QuestDrawer";
import { CelebrationLayer } from "@/components/celebrate/CelebrationLayer";
import { SettingsModal } from "./SettingsModal";

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useGame.persist.hasHydrated()) setHydrated(true);
    const unsub = useGame.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);
  return hydrated;
}

export function Providers({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const onboarded = useGame((s) => s.onboarded);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {!hydrated ? (
          <BootScreen key="boot" />
        ) : !onboarded ? (
          <Onboarding key="onboarding" />
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            {children}
            <QuestDrawer />
            <SettingsModal />
          </motion.div>
        )}
      </AnimatePresence>
      {hydrated && onboarded && <CelebrationLayer />}
    </MotionConfig>
  );
}
