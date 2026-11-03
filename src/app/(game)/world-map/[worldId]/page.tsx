import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldDetail } from "@/components/world/WorldDetail";
import type { WorldId } from "@/data/types";
import { getWorld, WORLDS } from "@/data/worlds";

export function generateStaticParams() {
  return WORLDS.map((w) => ({ worldId: w.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ worldId: string }> }): Promise<Metadata> {
  const { worldId } = await params;
  return { title: getWorld(worldId)?.name ?? "World" };
}

export default async function Page({ params }: { params: Promise<{ worldId: string }> }) {
  const { worldId } = await params;
  if (!getWorld(worldId)) notFound();
  return <WorldDetail worldId={worldId as WorldId} />;
}
