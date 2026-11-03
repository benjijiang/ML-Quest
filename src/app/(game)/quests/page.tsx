import type { Metadata } from "next";
import { QuestLog } from "@/components/quest/QuestLog";

export const metadata: Metadata = { title: "Quest Log" };

export default function Page() {
  return <QuestLog />;
}
