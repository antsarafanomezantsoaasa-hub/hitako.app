import React, { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Menu, X, type LucideIcon } from "lucide-react";
import { MemberAvatar } from "@/components/MemberAvatar";
import MemberSpaceSidebar from "./MemberSpaceSidebar";
import UpgradeAccessDialog from "./UpgradeAccessDialog";
import logoAsset from "@/assets/hitako-logo-new.png";
import type { AuthUser, UserProfile } from "@/types/auth";

interface MemberSpaceShellProps {
  children: React.ReactNode;
  profile: UserProfile;
  user: AuthUser;
  displayName: string;
  streakDays: number;
  onSignOut: () => void;
  // Passed straight through to MemberSpaceSidebar — see its own doc comment.
  homeHref?: string;
}

export default function MemberSpaceShell({
  children,
  profile,
  user,
  displayName,
  streakDays,
  onSignOut,
  homeHref,
}: MemberSpaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // The upgrade popup lives here, above the mobile drawer: the drawer unmounts
  // its sidebar the moment it closes, which previously killed the dialog too.
  const [lockedSection, setLockedSection] = useState<{ label: string; icon: LucideIcon } | null>(
    null,
  );
  const firstName = displayName?.trim().split(/\s+/)[0];
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Section changes are now real navigations (see MemberSpaceSidebar's
  // <Link> list) rather than an onNavigate callback, so there's no call
  // site left to close the mobile drawer from — close it whenever the
  // route itself changes instead, same pattern as the public site's Nav.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full bg-member-canvas text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-[240px] md:shrink-0 md:sticky md:top-0 md:h-screen md:border-r md:border-border">
        <MemberSpaceSidebar
          profile={profile}
          user={user}
          displayName={displayName}
          streakDays={streakDays}
          onSignOut={onSignOut}
          homeHref={homeHref}
          onLockedSection={setLockedSection}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-foreground/40 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed left-0 top-0 h-full w-[260px] max-w-[80vw] z-40 overflow-y-auto shadow-elegant">
          <MemberSpaceSidebar
            profile={profile}
            user={user}
            displayName={displayName}
            streakDays={streakDays}
            onSignOut={onSignOut}
            onLinkClick={() => setSidebarOpen(false)}
            homeHref={homeHref}
            onLockedSection={setLockedSection}
          />
        </div>
      )}

      {/* Right column: mobile top bar (in normal flow, never overlaps
          page content) + the scrollable main content area. On desktop the
          top bar is hidden since the sidebar already carries this info. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            className="shrink-0 rounded-lg border border-border bg-card p-2 text-foreground shadow-card transition hover:bg-accent"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex min-w-0 items-center">
            <img src={logoAsset} alt="HiTako Academy" className="h-8 w-auto shrink-0" />
          </div>

          <MemberAvatar
            name={displayName}
            avatarPath={profile?.avatar_url}
            className="ml-auto h-8 w-8 shrink-0"
            fallbackClassName="text-xs"
          />
        </div>

        {/* Main Content */}
        <main className="relative w-full flex-1 overflow-y-auto bg-member-canvas">
          <div className="pointer-events-none absolute inset-0 bg-member-canvas-glow" />
          <div className="relative">{children}</div>
        </main>
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
