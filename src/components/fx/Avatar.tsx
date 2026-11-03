import { useId } from "react";
import { getAvatar } from "@/data/avatars";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/cn";

/** Hexagonal sigil avatar with a gradient frame. */
export function Avatar({ id, size = 48, className, ring }: { id: string; size?: number; className?: string; ring?: boolean }) {
  const a = getAvatar(id);
  const gid = `av-${useId().replace(/:/g, "")}`;
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={a.from} />
            <stop offset="100%" stopColor={a.to} />
          </linearGradient>
          <radialGradient id={`${gid}-fill`} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor={a.from} stopOpacity="0.22" />
            <stop offset="100%" stopColor="#080A0F" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill={`url(#${gid}-fill)`} stroke={`url(#${gid})`} strokeWidth="2.5" />
        {ring && <polygon points="50,12 85,32 85,68 50,88 15,68 15,32" fill="none" stroke={a.from} strokeOpacity="0.25" strokeWidth="1" />}
      </svg>
      <div className="absolute inset-0 grid place-items-center" style={{ color: a.from }}>
        <Icon name={a.icon} size={size * 0.4} strokeWidth={1.6} />
      </div>
    </div>
  );
}
