import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BossBattle } from "@/components/boss/BossBattle";
import { getQuest } from "@/data/quests";
import type { WorldId } from "@/data/types";
import { getWorld, WORLDS } from "@/data/worlds";

export function generateStaticParams() {
  return WORLDS.map((w) => ({ worldId: w.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ worldId: string }> }): Promise<Metadata> {
  const { worldId } = await params;
  const w = getWorld(worldId);
  return { title: w ? `Boss: ${getQuest(w.bossQuestId)?.boss?.codename}` : "Boss Battle" };
}

export default async function Page({ params }: { params: Promise<{ worldId: string }> }) {
  const { worldId } = await params;
  if (!getWorld(worldId)) notFound();
  return <BossBattle worldId={worldId as WorldId} />;
}
