"use client";

import { Download, RotateCcw, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar } from "@/components/fx/Avatar";
import { Button, HudLabel, Panel } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { AVATARS } from "@/data/avatars";
import { cn } from "@/lib/cn";
import type { SaveData } from "@/lib/save";
import { toSave, useGame } from "@/lib/store";
import { useUI } from "@/lib/ui";

export function SettingsModal() {
  const open = useUI((s) => s.settingsOpen);
  const setOpen = useUI((s) => s.setSettingsOpen);
  return (
    <Modal open={open} onClose={() => setOpen(false)} label="Settings">
      {open && <SettingsBody onClose={() => setOpen(false)} />}
    </Modal>
  );
}

function SettingsBody({ onClose }: { onClose: () => void }) {
  const game = useGame();
  const [name, setName] = useState(game.profile.username);
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportSave = () => {
    const blob = new Blob([JSON.stringify(toSave(useGame.getState()), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ml-quest-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSave = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as SaveData;
      if (data.version !== 1 || typeof data.quests !== "object" || !Array.isArray(data.xpLedger)) throw new Error("bad");
      game.importSave(data);
      setMsg("Save imported.");
    } catch {
      setMsg("That file isn't a valid ML QUEST save.");
    }
  };

  return (
    <Panel className="p-6" glow>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="display text-lg font-semibold">Player Settings</h2>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-white/5 hover:text-ink" aria-label="Close settings">
          <X size={16} />
        </button>
      </div>

      <label className="block">
        <HudLabel className="mb-2">Callsign</HudLabel>
        <input
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => game.setProfile({ username: name.trim() || "Apprentice" })}
          className="h-10 w-full rounded-lg border border-line-strong bg-void/60 px-3 text-sm text-ink outline-none transition-colors focus:border-cyan/50"
        />
      </label>

      <fieldset className="mt-5">
        <legend className="hud-label mb-2">Avatar</legend>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              onClick={() => game.setProfile({ avatarId: a.id })}
              className={cn(
                "grid place-items-center rounded-xl border p-2 transition-colors",
                game.profile.avatarId === a.id ? "border-cyan/50 bg-cyan/[0.06]" : "border-line hover:border-line-strong",
              )}
              aria-label={a.name}
              aria-pressed={game.profile.avatarId === a.id}
            >
              <Avatar id={a.id} size={36} />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 border-t border-line pt-5">
        <HudLabel className="mb-3">Save data · stored locally in this browser</HudLabel>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={exportSave}>
            <Download size={14} /> Export
          </Button>
          <Button size="sm" onClick={() => fileRef.current?.click()}>
            <Upload size={14} /> Import
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importSave(e.target.files[0])}
          />
          {!confirmReset ? (
            <Button size="sm" variant="danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={14} /> Reset progress
            </Button>
          ) : (
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                game.resetProgress();
                onClose();
              }}
            >
              Confirm — erase everything
            </Button>
          )}
        </div>
        {msg && <p className="mt-3 text-xs text-ink-muted" role="status">{msg}</p>}
      </div>
    </Panel>
  );
}
