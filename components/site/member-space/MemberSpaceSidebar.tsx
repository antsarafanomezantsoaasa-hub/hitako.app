import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  MessageCircle,
  Trophy,
  Megaphone,
  TrendingUp,
  HeartHandshake,
  Gamepad2,
  Lock,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { MemberAvatar } from "@/components/MemberAvatar";
import { useAuth } from "@/hooks/use-auth";
import UpgradeAccessDialog from "./UpgradeAccessDialog";

interface MemberSpaceSidebarProps {
  profile: any;
  user: any;
  displayName: string;
  streakDays: number;
  onSignOut: () => void;
  // Fired on every nav click — MemberSpaceShell uses this to close the
  // mobile drawer. Route changes themselves are handled by real <Link>
  // navigation now, not by this callback.
  onLinkClick?: () => void;
  // Where the "My HQ" link points. Defaults to /mon-espace; the free-tier
  // home (src/routes/zero.tsx) passes "/zero" so the link stays on the page
  // the learner is already on instead of round-tripping through
  // /mon-espace's free-tier redirect back to /zero.
  homeHref?: string;
  // When provided, the "locked section" popup is owned by MemberSpaceShell
  // instead of this component. Required on mobile: the drawer unmounts the
  // sidebar as soon as it closes, which used to take the dialog with it.
  onLockedSection?: (section: { label: string; icon: LucideIcon }) => void;
}

// Real routes for the member-space nav — most live under /mon-espace (see
// src/routes/mon-espace/*), plus the Game Arena hub at /jeux. Each entry is
// a genuine URL now, not a client-only tab id.
const SECTIONS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/mon-espace", label: "My HQ", icon: Home },
  { to: "/mon-espace/family", label: "HiTako Family", icon: MessageCircle },
  { to: "/jeux", label: "Game Arena", icon: Gamepad2 },
  { to: "/mon-espace/hall-of-fame", label: "Hall of Fame", icon: Trophy },
  { to: "/mon-espace/pulse", label: "HiTako Pulse", icon: Megaphone },
  { to: "/mon-espace/progress", label: "My Progress", icon: TrendingUp },
  { to: "/mon-espace/guide", label: "Family Guide", icon: HeartHandshake },
];

// Sections reserved for paying members. A "free" role account can still see
// them in the nav (so the full experience stays visible and enticing), but
// tapping one opens the UpgradeAccessDialog instead of navigating — "My HQ"
// and the Game Arena stay open to everyone, free tier included.
const MEMBERS_ONLY_PATHS = new Set([
  "/mon-espace/family",
  "/mon-espace/hall-of-fame",
  "/mon-espace/pulse",
  "/mon-espace/progress",
  "/mon-espace/guide",
]);

export default function MemberSpaceSidebar({
  profile,
  user,
  displayName,
  streakDays,
  onSignOut,
  onLinkClick,
  homeHref = "/mon-espace",
  onLockedSection,
}: MemberSpaceSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isFree } = useAuth();
  const [lockedSection, setLockedSection] = useState<{ label: string; icon: LucideIcon } | null>(
    null,
  );

  const sections = useMemo(
    () => SECTIONS.map((s) => (s.to === "/mon-espace" ? { ...s, to: homeHref } : s)),
    [homeHref],
  );

  const firstName = displayName?.trim().split(/\s+/)[0];

  const initials = useMemo(() => {
    if (!displayName) return "M";
    const parts = displayName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  }, [displayName]);

  return (
    <div className="flex flex-col h-full bg-card/70 backdrop-blur border-r border-border">
      {/* Member profile — moved up from the footer (in place of the old
          HiTako Academy logo/name) so the nav below gets the extra room
          and doesn't need to scroll. */}
      <div className="p-4 border-b border-border">
        <Link
          to={homeHref}
          onClick={onLinkClick}
          className="w-full flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-accent"
        >
          <MemberAvatar
            name={displayName}
            avatarPath={profile?.avatar_url}
            className="w-10 h-10 shrink-0"
            fallbackClassName="text-xs"
          />
          <div className="min-w-0 flex-1 text-left">
            <div className="text-sm font-bold truncate">{displayName}</div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
              <span>🔥 {streakDays}d</span>
              <span>•</span>
              <span>{profile?.level}</span>
            </div>
          </div>
        </Link>
        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          Member Space
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = pathname === section.to;
          const isLocked = isFree && MEMBERS_ONLY_PATHS.has(section.to);

          if (isLocked) {
            return (
              <button
                key={section.to}
                type="button"
                onClick={() => {
                  const picked = { label: section.label, icon: Icon };
                  if (onLockedSection) {
                    // Shell owns the dialog — close the drawer, popup survives.
                    onLinkClick?.();
                    onLockedSection(picked);
                    return;
                  }
                  setLockedSection(picked);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-foreground transition-all hover:bg-accent"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{section.label}</span>
                <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
            );
          }

          return (
            <Link
              key={section.to}
              to={section.to}
              onClick={onLinkClick}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? "bg-gradient-brand text-primary-foreground shadow-elegant"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{section.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign out — stays pinned at the bottom, in its original spot */}
      <div className="border-t border-border p-3">
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>

      {lockedSection && (
        <UpgradeAccessDialog
          open={!!lockedSection}
          onOpenChange={(open) => !open && setLockedSection(null)}
          featureLabel={lockedSection.label}
          featureIcon={lockedSection.icon}
          firstName={firstName}
        />
      )}
    </div>
  );
}
