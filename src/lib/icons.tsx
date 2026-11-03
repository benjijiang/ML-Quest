import {
  Activity,
  Atom,
  BookOpen,
  Bot,
  Boxes,
  Brain,
  Code2,
  Cpu,
  Crosshair,
  Crown,
  Dices,
  Eye,
  Flame,
  FlaskConical,
  Gauge,
  Gem,
  Grid3x3,
  Joystick,
  Layers,
  Microscope,
  Move3d,
  Network,
  Orbit,
  PenLine,
  Rocket,
  RotateCcw,
  Route,
  Scale,
  ScanEye,
  Shield,
  Sigma,
  Sparkles,
  Spline,
  Table2,
  Telescope,
  Terminal,
  TrendingDown,
  TrendingUp,
  Workflow,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

export function GithubIcon(props: LucideProps) {
  const { size = 24, strokeWidth = 1.75, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...(rest as React.SVGProps<SVGSVGElement>)}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const REGISTRY: Record<string, LucideIcon | typeof GithubIcon> = {
  activity: Activity,
  atom: Atom,
  book: BookOpen,
  bot: Bot,
  boxes: Boxes,
  brain: Brain,
  code: Code2,
  cpu: Cpu,
  crosshair: Crosshair,
  crown: Crown,
  dices: Dices,
  eye: Eye,
  flame: Flame,
  flask: FlaskConical,
  gauge: Gauge,
  gem: Gem,
  git: GithubIcon,
  grid: Grid3x3,
  joystick: Joystick,
  layers: Layers,
  microscope: Microscope,
  move: Move3d,
  network: Network,
  orbit: Orbit,
  pen: PenLine,
  rocket: Rocket,
  rotate: RotateCcw,
  route: Route,
  scale: Scale,
  scan: ScanEye,
  shield: Shield,
  sigma: Sigma,
  sparkles: Sparkles,
  spline: Spline,
  table: Table2,
  telescope: Telescope,
  terminal: Terminal,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  workflow: Workflow,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = REGISTRY[name] ?? Sparkles;
  return <C aria-hidden="true" {...props} />;
}
