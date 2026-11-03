/** Local-time date key, e.g. "2026-11-03". */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(a: string, b: string): number {
  const ms = parseDayKey(b).getTime() - parseDayKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function addDays(key: string, n: number): string {
  const d = parseDayKey(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
