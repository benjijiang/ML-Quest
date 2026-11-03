import { Archive, LayoutDashboard, Map, ScrollText, Workflow, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  key: string;
}

export const NAV: NavItem[] = [
  { href: "/", label: "Command Center", short: "Command", icon: LayoutDashboard, key: "1" },
  { href: "/world-map", label: "World Map", short: "Worlds", icon: Map, key: "2" },
  { href: "/skill-tree", label: "Skill Tree", short: "Skills", icon: Workflow, key: "3" },
  { href: "/quests", label: "Quest Log", short: "Quests", icon: ScrollText, key: "4" },
  { href: "/vault", label: "Research Vault", short: "Vault", icon: Archive, key: "5" },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
