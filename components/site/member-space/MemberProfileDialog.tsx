import { Award, Flame, Mail, Sparkles, Star, Trophy, User as UserIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberAvatar } from "@/components/MemberAvatar";
import type { MemberProfile } from "@/hooks/use-auth";

/**
 * Profile popup opened from the avatar in the member top bar (/mon-espace
 * and /zero). Read-only account card: name, email and level (HiT START /
 * HiT FLOW / HiT PRO), presented in the candy "game HUD" style of the rest
 * of the member area. No lesson, progress, auth or routing logic here.
 */

interface MemberProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: MemberProfile;
  user: User;
  displayName: string;
}

const LEVEL_BLURB: Record<string, string> = {
  "HiT START": "Vous démarrez l'aventure — chaque leçon compte !",
  "HiT FLOW": "Vous êtes lancé — gardez le rythme !",
  "HiT PRO": "Niveau expert — bravo, vous inspirez la famille !",
};

export default function MemberProfileDialog({
  open,
  onOpenChange,
  profile,
  user,
  displayName,
}: MemberProfileDialogProps) {
  const level = profile.level;
  const email = profile.email ?? user.email ?? "—";

  const stats = [
    { icon: Flame, label: "Série", value: `${profile.streak_days} j` },
    { icon: Star, label: "Leçons", value: `${profile.lessons_completed}` },
    { icon: Trophy, label: "Progrès", value: `${profile.progress_percent}%` },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88dvh] w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-0 overflow-y-auto overscroll-contain rounded-[2rem] border-none bg-card p-0 shadow-elegant sm:w-full [&>button]:z-10 [&>button]:text-primary-foreground [&>button]:hover:bg-white/20 [&>button]:hover:text-primary-foreground">
        {/* Candy header rail */}
        <div className="relative overflow-hidden bg-gradient-brand px-5 pb-8 pt-8 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, rgba(255,255,255,0.9) 0 14px, rgba(255,255,255,0) 14px 34px)",
            }}
          />
          <Sparkles className="pointer-events-none absolute left-8 top-6 h-4 w-4 text-white/50" />
          <Sparkles className="pointer-events-none absolute right-12 top-14 h-3 w-3 text-white/40" />

          <DialogHeader className="relative space-y-1 text-center sm:text-center">
            <DialogTitle className="font-display text-xl font-extrabold text-primary-foreground">
              Profile
            </DialogTitle>
            <DialogDescription className="sr-only">
              Informations de votre compte HiTako Academy
            </DialogDescription>
          </DialogHeader>

          <span className="relative mx-auto mt-4 flex w-fit items-center justify-center rounded-3xl border-[3px] border-primary-foreground/70 bg-primary-foreground/20 p-1 shadow-sticker-soft">
            <MemberAvatar
              name={displayName}
              avatarPath={profile.avatar_url}
              className="h-20 w-20 rounded-2xl"
              fallbackClassName="rounded-2xl text-lg"
            />
          </span>
        </div>

        {/* Account card */}
        <div className="-mt-4 rounded-t-[1.75rem] bg-card px-5 pb-6 pt-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-primary">
            Account
          </p>

          <div className="mt-3 space-y-3 rounded-2xl border-2 border-primary/15 bg-secondary/40 px-4 py-4 shadow-sticker-soft">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Name
                </p>
                <p className="truncate font-display text-base font-extrabold text-foreground">
                  {profile.full_name?.trim() || displayName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Level
                </p>
                <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground shadow-sticker-soft">
                  <Sparkles className="h-3 w-3" />
                  {level}
                </span>
                <p className="mt-1.5 text-pretty text-[11px] text-muted-foreground">
                  {LEVEL_BLURB[level] ?? ""}
                </p>
              </div>
            </div>
          </div>

          {/* Read-only glance at the stats already tracked elsewhere */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 rounded-2xl border-2 border-primary/15 bg-secondary/40 px-2 py-3 shadow-sticker-soft"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-display text-sm font-extrabold text-foreground">{value}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
