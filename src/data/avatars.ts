export interface AvatarPreset {
  id: string;
  name: string;
  icon: string;
  from: string;
  to: string;
}

export const AVATARS: AvatarPreset[] = [
  { id: "synapse", name: "Synapse", icon: "brain", from: "#00E5FF", to: "#8B5CF6" },
  { id: "vector", name: "Vector", icon: "crosshair", from: "#38BDF8", to: "#00E5FF" },
  { id: "kernel", name: "Kernel", icon: "cpu", from: "#8B5CF6", to: "#EC4899" },
  { id: "orbit", name: "Orbit", icon: "orbit", from: "#34D399", to: "#00E5FF" },
  { id: "automaton", name: "Automaton", icon: "bot", from: "#F59E0B", to: "#EF4444" },
  { id: "oracle", name: "Oracle", icon: "telescope", from: "#CDB07A", to: "#8B5CF6" },
];

export function getAvatar(id: string): AvatarPreset {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
