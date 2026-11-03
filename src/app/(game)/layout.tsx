import { MobileNav, Sidebar } from "@/components/shell/Sidebar";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="grid-bg grid-fade absolute inset-0 opacity-60" />
        <div className="absolute -top-40 left-1/3 h-[520px] w-[720px] rounded-full bg-cyan/[0.05] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[620px] rounded-full bg-violet/[0.05] blur-[120px]" />
      </div>
      <Sidebar />
      <MobileNav />
      <main className="pb-24 lg:pb-0 lg:pl-[248px]">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
