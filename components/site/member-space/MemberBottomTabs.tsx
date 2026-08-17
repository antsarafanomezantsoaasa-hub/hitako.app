import { Link, useRouterState } from "@tanstack/react-router";
import { Gamepad2, Home, Lock, Megaphone, Trophy, TrendingUp, type LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/**
 * Bottom app-style tab bar for the /mon-espace and /zero member area,
 * replacing the old MemberSpaceSidebar. Each tab is still a real route (not
 * a client-side tab id) — same navigation model the sidebar used, just
 * presented the way the approved wireframe (mon-espace-app-mockup.html)
 * shows it: 5 tabs with "My HQ" centered as the raised hub button.
 *
 * "HiTako Family" and "Family Guide" intentionally aren't tabs here — they
 * didn't fit in a 5-tab bar (see the wireframe's own notes), so they moved
 * to the top bar's inbox and settings icons instead (see MemberTopBar).
 */

type Tab = {
  to: string;
  label: string;
  icon: LucideIcon;
  locked?: boolean;
  center?: boolean;
};

// Sections reserved for paying members — same set MemberSpaceSidebar used to
// gate, minus /mon-espace/family and /mon-espace/guide which moved to the top
// bar. Game Arena, My HQ and Hall of Fame stay open to everyone, free tier
// included — Hall of Fame moved to the top-level /hall-of-fame route
// (see src/routes/hall-of-fame.tsx) specifically so it works the same way
// from both /zero and /mon-espace.
const MEMBERS_ONLY_TABS = new Set(["/mon-espace/pulse", "/mon-espace/progress"]);

interface MemberBottomTabsProps {
  homeHref?: string;
  onLockedSection: (section: { label: string; icon: LucideIcon }) => void;
}

export default function MemberBottomTabs({
  homeHref = "/mon-espace",
  onLockedSection,
}: MemberBottomTabsProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isFree } = useAuth();

  const tabs: Tab[] = [
    { to: "/jeux", label: "Game Arena", icon: Gamepad2 },
    { to: "/hall-of-fame", label: "Hall of Fame", icon: Trophy },
    { to: homeHref, label: "My HQ", icon: Home, center: true },
    { to: "/mon-espace/pulse", label: "HiTako Pulse", icon: Megaphone, locked: true },
    { to: "/mon-espace/progress", label: "My Progress", icon: TrendingUp, locked: true },
  ];

  return (
    <nav className="relative flex items-center justify-around rounded-t-[1.75rem] border-t-2 border-primary/15 bg-card px-1 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-elegant">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-wave opacity-80"
      />
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.to;
        const isLocked = Boolean(tab.locked) && isFree && MEMBERS_ONLY_TABS.has(tab.to);

        if (tab.center) {
          return (
            <Link
              key={tab.label}
              to={tab.to}
              aria-label={tab.label}
              title={tab.label}
              className="-mt-7 flex min-w-0 flex-1 items-center justify-center px-1 transition-transform active:scale-95"
            >
              <span
                className={`node-gloss flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-card transition-transform ${
                  isActive
                    ? "bg-node text-primary-foreground shadow-sticker"
                    : "bg-node text-primary-foreground shadow-sticker-soft"
                }`}
              >
                <Icon className="h-7 w-7" strokeWidth={2.5} />
              </span>
            </Link>
          );
        }

        if (isLocked) {
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => onLockedSection({ label: tab.label, icon: Icon })}
              aria-label={tab.label}
              title={tab.label}
              className="relative flex min-w-0 flex-1 items-center justify-center px-1 py-1.5 text-muted-foreground opacity-70 transition-transform active:scale-95"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                <Icon className="h-6 w-6" />
              </span>
              <span className="absolute right-[22%] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-muted-foreground shadow-sticker-soft">
                <Lock className="h-2.5 w-2.5" />
              </span>
            </button>
          );
        }

        return (
          <Link
            key={tab.label}
            to={tab.to}
            aria-label={tab.label}
            title={tab.label}
            className={`flex min-w-0 flex-1 items-center justify-center px-1 py-1.5 transition-transform active:scale-95 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                isActive ? "bg-primary/12 text-primary" : "bg-muted/70"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
