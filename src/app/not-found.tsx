import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-void px-6 text-center">
      <div>
        <div className="hud-label text-cyan">Signal lost · 404</div>
        <h1 className="display mt-3 text-3xl font-semibold">Uncharted territory</h1>
        <p className="mt-2 text-ink-muted">This sector doesn&apos;t exist on the map.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-cyan hover:underline">
          Return to Command Center
        </Link>
      </div>
    </div>
  );
}
