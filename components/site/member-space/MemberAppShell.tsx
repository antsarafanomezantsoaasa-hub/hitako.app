import { useState, type MouseEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { MemberProfile } from "@/hooks/use-auth";
import { useAmbientBackground } from "@/hooks/use-ambient-background";
import { playClick } from "@/lib/sound-fx";
import doodlesTile from "@/assets/doodles-tile.png";
import MemberTopBar from "./MemberTopBar";
import MemberBottomTabs from "./MemberBottomTabs";
import UpgradeAccessDialog from "./UpgradeAccessDialog";

// Any of these count as a "button" for SFX purposes — real <button>s plus
// the ARIA roles Radix primitives use under the hood for menu items
// (Settings ▸ Family Guide / Sign out, etc.) that behave like buttons but
// don't render as a literal <button> element. Add a `data-no-click-sfx`
// attribute to opt a specific control out if one is ever needed.
const CLICKABLE_SELECTOR =
  'button, [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';

/**
 * App-style shell for the whole /mon-espace member area (and its free-tier
 * twin /zero) — built from mon-espace-app-mockup.html, replacing the old
 * sidebar + mobile hamburger bar (MemberSpaceShell/MemberSpaceSidebar).
 *
 * Layout model (mobile-app, not document): the shell owns a fixed 100dvh
 * viewport. The top bar and the bottom tab bar are non-scrolling rails; the
 * only scrolling element is the [data-member-scroll] pane. That's what makes the
 * header/footer genuinely stick on iOS/Android (position: sticky inside a
 * page-level scroll still drifts with URL-bar resize) and it also gives the
 * lesson path a single, native, momentum scroller to live in instead of a
 * nested one.
 */

interface MemberAppShellProps {
  children: ReactNode;
  profile: MemberProfile;
  user: User;
  displayName: string;
  onSignOut: () => void;
  // Where the "My HQ" tab/avatar point — /mon-espace for paid members,
  // /zero for the free-tier home. See src/routes/mon-espace.tsx and
  // src/routes/zero.tsx.
  homeHref?: string;
}

export default function MemberAppShell({
  children,
  profile,
  user,
  displayName,
  onSignOut,
  homeHref = "/mon-espace",
}: MemberAppShellProps) {
  const [lockedSection, setLockedSection] = useState<{ label: string; icon: LucideIcon } | null>(
    null,
  );
  const firstName = displayName?.trim().split(/\s+/)[0];

  // Whole-page ambience (ukulele bed, looped, low volume) for the entire
  // member area — see the hook for exactly when it starts/pauses/stops.
  const { muted: ambientMuted, toggleMuted: onToggleAmbientMuted } = useAmbientBackground();

  // Single delegated listener for every button-like control anywhere inside
  // the member shell (top bar, bottom tabs, dialogs — including portaled
  // Radix content, since React's synthetic events bubble through the
  // component tree regardless of where they're portaled in the DOM) instead
  // of wiring click.mp3 into each one individually.
  function handleShellClick(event: MouseEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>(CLICKABLE_SELECTOR);
    if (!target || target.hasAttribute("data-no-click-sfx")) return;
    if ("disabled" in target && (target as HTMLButtonElement).disabled) return;
    if (target.getAttribute("aria-disabled") === "true") return;
    playClick();
  }

  return (
    <div
      className="app-viewport relative flex w-full flex-col overflow-hidden bg-member-canvas text-foreground"
      onClickCapture={handleShellClick}
    >
      {/* Decorative playground backdrop. It lives OUTSIDE the scrolling pane on
          purpose: fixed-position + blurred layers *inside* an overflow-y-auto
          container make iOS Safari/Chrome drop repaint tiles, which is what
          caused the repeating blank bands while scrolling the lesson path.
          As a sibling of the scroller it is composited once and never
          re-rastered. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-member-canvas-glow" />
        <div className="absolute inset-0 bg-playground" />
        <div
          className="bg-playground-doodles absolute inset-0"
          style={{ backgroundImage: `url(${doodlesTile})` }}
        />
        {/* Frosted veil over the wallpaper — keeps the doodles visible while
            giving every node, card and paragraph above them a calm, legible
            surface to sit on. */}
        <div className="bg-playground-veil absolute inset-0" />
        <span className="animate-drift absolute left-[-3rem] top-24 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <span className="animate-drift absolute right-[-4rem] top-1/3 h-52 w-52 rounded-full bg-primary-glow/15 blur-3xl [animation-delay:-4s]" />
        <span className="animate-drift absolute bottom-10 left-1/4 h-44 w-44 rounded-full bg-accent/25 blur-3xl [animation-delay:-8s]" />
      </div>

      <header className="relative z-30 shrink-0">
        <div className="mx-auto w-full max-w-2xl">
          <MemberTopBar
            profile={profile}
            user={user}
            displayName={displayName}
            homeHref={homeHref}
            onSignOut={onSignOut}
            onLockedSection={setLockedSection}
            ambientMuted={ambientMuted}
            onToggleAmbientMuted={onToggleAmbientMuted}
          />
        </div>
      </header>

      <div
        data-member-scroll
        className="scroll-smooth-touch relative z-10 min-h-0 flex-1 overflow-y-auto"
      >
        {/* pb accounts for the iOS home-indicator inset so the last card is
            never trapped under the tab bar. */}
        <div className="relative mx-auto w-full max-w-2xl pb-[calc(2rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>

      <footer className="relative z-30 shrink-0 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-2xl">
          <MemberBottomTabs homeHref={homeHref} onLockedSection={setLockedSection} />
        </div>
      </footer>

      {lockedSection && (
        <UpgradeAccessDialog
          open={!!lockedSection}
          onOpenChange={(open) => !open && setLockedSection(null)}
          featureLabel={lockedSection.label}
          featureIcon={lockedSection.icon}
          firstName={firstName}
          subscriptionTarget={
            profile.preferred_format === "coach"
              ? { to: "/bienvenue-coach", hash: "hamafiso-coach" }
              : { to: "/zero", hash: "ny-momba-ny-abonnement" }
          }
        />
      )}
    </div>
  );
}
