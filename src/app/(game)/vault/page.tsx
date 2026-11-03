import type { Metadata } from "next";
import { ResearchVault } from "@/components/vault/ResearchVault";

export const metadata: Metadata = { title: "Research Vault" };

export default function Page() {
  return <ResearchVault />;
}
