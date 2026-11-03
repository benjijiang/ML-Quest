import type { Metadata } from "next";
import { WorldMap } from "@/components/world/WorldMap";

export const metadata: Metadata = { title: "World Map" };

export default function Page() {
  return <WorldMap />;
}
