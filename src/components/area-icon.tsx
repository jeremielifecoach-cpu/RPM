import {
  Heart,
  Sun,
  Users,
  Clock,
  Briefcase,
  Coins,
  Sparkles,
  PartyPopper,
  Star,
  Leaf,
  BookOpen,
  Home,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  heart: Heart,
  sun: Sun,
  users: Users,
  clock: Clock,
  briefcase: Briefcase,
  coins: Coins,
  sparkles: Sparkles,
  party: PartyPopper,
  star: Star,
  leaf: Leaf,
  book: BookOpen,
  home: Home,
};

export function AreaIcon({
  icon,
  className,
  strokeWidth = 2,
}: {
  icon: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = MAP[icon] ?? Star;
  return <Cmp className={className} strokeWidth={strokeWidth} />;
}
