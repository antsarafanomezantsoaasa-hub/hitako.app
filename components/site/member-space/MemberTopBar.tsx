import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Flame,
  Gem,
  HeartHandshake,
  Lock,
  LogOut,
  Mail,
  Settings,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { MemberAvatar } from "@/components/MemberAvatar";
import MemberProfileDialog from "./MemberProfileDialog";
import MemberNewsDialog from "./MemberNewsDialog";
import { useAuth, type MemberProfile } from "@/hooks/use-auth";
import { useDailyPhrase } from "@/hooks/use-daily-phrase";
import { useMemberXp } from "@/hooks/use-member-xp";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Top app bar for the /mon-espace and /zero member area, replacing the old
 * mobile-only hamburger bar. Three-zone grid (left / center / right) so the
 * avatar sits dead-center regardless of how much sits in either side group —
 * same reasoning as the wireframe prototype's .topbar.
 *
 * Styling is the "game HUD" pass: chunky sticker pills on a brand-gradient
 * rail, same controls and same behaviour as before.
 *
 * "HiTako Family" (inbox icon) and "Family Guide" (tucked into settings)
 * don't have their own bottom tab — see MemberBottomTabs — so they live
 * here instead, matching the wireframe's own call on that ambiguity.
 */

interface MemberTopBarProps {
  profile: MemberProfile;
  user: User;
  displayName: string;
  homeHref?: string;
  onSignOut: () => void;
  onLockedSection: (section: { label: string; icon: LucideIcon }) => void;
  /** Whether the whole-page ambient loop (see `useAmbientBackground`) is currently muted. */
  ambientMuted: boolean;
  /** Mutes/unmutes the ambient loop; surfaced here as the settings-menu toggle. */
  onToggleAmbientMuted: () => void;
}

const HUD_BUTTON =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-primary-foreground/25 bg-primary-foreground/15 text-primary-foreground backdrop-blur transition-transform active:scale-95";

export default function MemberTopBar({
  profile,
  user,
  displayName,
  homeHref = "/mon-espace",
  onSignOut,
  onLockedSection,
  ambientMuted,
  onToggleAmbientMuted,
}: MemberTopBarProps) {
  const { isFree } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const navigate = useNavigate();
  const dailyPhrase = useDailyPhrase();
  const xp = useMemberXp(user.id);

  function openGuide() {
    if (isFree) {
      onLockedSection({ label: "Family Guide", icon: HeartHandshake });
      return;
    }
    void navigate({ to: "/mon-espace/guide" });
  }

  return (
    <div className="relative overflow-hidden rounded-b-[2rem] bg-gradient-brand pb-3 shadow-elegant">
      {/* candy stripes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.9) 0 14px, rgba(255,255,255,0) 14px 34px)",
        }}
      />

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 pb-2.5 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          <button
            type="button"
            onClick={() => setNewsOpen(true)}
            title="News & updates"
            aria-label="News and updates"
            className={HUD_BUTTON}
          >
            <Mail className="h-4 w-4" />
          </button>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-primary-foreground/25 bg-primary-foreground/15 px-3 py-1.5 text-sm font-extrabold text-primary-foreground backdrop-blur">
            <Flame className="h-4 w-4 text-amber-300" fill="currentColor" />
            {profile.streak_days}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="justify-self-center transition-transform active:scale-95"
          aria-label="Profile"
          title="Profile"
        >
          <span className="flex items-center justify-center rounded-full border-[3px] border-primary-foreground/70 bg-primary-foreground/20 p-0.5 shadow-sticker-soft">
            <MemberAvatar
              name={displayName}
              avatarPath={profile.avatar_url}
              className="h-10 w-10 shrink-0"
              fallbackClassName="text-xs"
            />
          </span>
        </button>

        <MemberNewsDialog open={newsOpen} onOpenChange={setNewsOpen} />

        <MemberProfileDialog
          open={profileOpen}
          onOpenChange={setProfileOpen}
          profile={profile}
          user={user}
          displayName={displayName}
        />

        <div className="flex min-w-0 items-center gap-2 justify-self-end">
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-primary-foreground/70 bg-primary-foreground px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-primary shadow-sticker-soft"
            title="Your total XP"
          >
            <Gem className="h-3 w-3" fill="currentColor" />
            {xp === null ? "···" : `${xp} XP`}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" title="Settings" aria-label="Settings" className={HUD_BUTTON}>
                <Settings className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={openGuide} className="gap-2">
                <HeartHandshake className="h-4 w-4" />
                Family Guide
                {isFree && <Lock className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={!ambientMuted}
                onCheckedChange={onToggleAmbientMuted}
                onSelect={(event) => event.preventDefault()}
                className="gap-2"
              >
                {ambientMuted ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                )}
                Ambient music
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={onSignOut}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative mx-4 flex min-w-0 items-center gap-2 rounded-full border-2 border-primary-foreground/25 bg-primary-foreground/15 px-3.5 py-2 text-xs text-primary-foreground backdrop-blur">
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-300" />
        <span className="shrink-0 font-bold">Daily phrase:</span>
        <span className="truncate italic text-primary-foreground/85">
          &ldquo;{dailyPhrase}&rdquo;
        </span>
      </div>
    </div>
  );
}
