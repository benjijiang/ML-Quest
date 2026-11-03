import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/oxanium";
import "./globals.css";
import { Providers } from "@/components/shell/Providers";

export const metadata: Metadata = {
  title: { default: "ML QUEST — Level Up Your Intelligence", template: "%s · ML QUEST" },
  description:
    "A gamified learning platform for Machine Learning, Deep Learning, Reinforcement Learning and Embodied AI. Learn → Build → Conquer → Level Up.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#080A0F",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
