import type { Metadata } from "next";
import { Suspense } from "react";
import { SkillTree } from "@/components/skills/SkillTree";

export const metadata: Metadata = { title: "Skill Tree" };

export default function Page() {
  return (
    <Suspense>
      <SkillTree />
    </Suspense>
  );
}
