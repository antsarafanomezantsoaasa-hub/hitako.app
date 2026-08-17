import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Gift, Loader2, Lock, Sparkles, Unlock } from "lucide-react";
import { ConfirmRegistration } from "@/components/site/confirm-registration";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import MemberAppShell from "@/components/site/member-space/MemberAppShell";
import { LessonPath } from "@/components/site/member-space/LessonPath";
export const Route = createFileRoute("/zero")({
  head: () => ({
    meta: [
      { title: "My HQ | HiTako Academy" },
      {
        name: "description",
        content:
          "Votre inscription HiT START est reçue. Confirmez-la pour débloquer votre première leçon HiTako Academy.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ZeroPage,
});

// /zero is the free-tier equivalent of /mon-espace's "My HQ": same
// MemberAppShell chrome (top bar with daily phrase, bottom tabs, sign-out)
// and the same lesson-path screen — except the path sits behind the
// "confirm your registration" unlock card, exactly like the free-preview
// mode of mon-espace-app-mockup.html. Tapping the card's CTA reveals the
// real ConfirmRegistration flow underneath the path.
const FREE_BONUS_LESSONS = [1, 2];

function ZeroPage() {
  const navigate = useNavigate();
  const { loading, user, profile, role, signOut, refresh } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [lockedPrompt, setLockedPrompt] = useState(false);
  const confirmRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/connexion" });
      return;
    }
    // /zero is reserved for the "free" role, Daily track — send other roles
    // to their own home, and Coach-track free accounts to /bienvenue-coach.
    if (role === "admin") navigate({ to: "/admin" });
    else if (role === "member") navigate({ to: "/mon-espace" });
    else if (role === "free" && profile?.preferred_format === "coach")
      navigate({ to: "/bienvenue-coach" });
  }, [loading, user, role, profile, navigate]);

  // Coming back from Leçon 01/02 doesn't remount AuthProvider, so the cached
  // profile (lessons completed, streak, progress) would still show the values
  // from before the lesson. Refetch once on entering /zero so the free-tier
  // stats reflect the completion that was just saved.
  useEffect(() => {
    if (loading || !user) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!showConfirm) return;
    const id = window.setTimeout(
      () => confirmRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
    return () => window.clearTimeout(id);
  }, [showConfirm]);

  const displayName = useMemo(
    () => profile?.full_name?.trim() || user?.email?.split("@")[0] || "Membre",
    [profile, user],
  );

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  if (loading || !user || !profile || role !== "free" || profile.preferred_format === "coach") {
    return (
      <div className="app-viewport flex items-center justify-center bg-member-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MemberAppShell
      profile={profile}
      user={user}
      displayName={displayName}
      onSignOut={handleSignOut}
      homeHref="/zero"
    >
      <div className="px-4 pt-4">
        <div className="animate-bonus-glow flex items-center gap-3 rounded-2xl border-2 border-amber-300/60 bg-card px-4 py-3 shadow-sticker-soft">
          <Gift className="h-4 w-4 shrink-0 text-primary" />
          <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">
            Cadeau de bienvenue : les <strong className="text-foreground">Leçons 01 et 02</strong>{" "}
            sont offertes. Confirmez votre inscription pour débloquer la suite du parcours.
          </p>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="bonus-shimmer shrink-0 rounded-full bg-gradient-brand px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground shadow-sticker-soft transition-transform hover:scale-105 active:translate-y-0.5"
          >
            Confirmer
          </button>
        </div>
      </div>

      <LessonPath
        variant="screen"
        level={profile.level}
        completedCount={profile.lessons_completed}
        // Free tier: Leçons 01 & 02 are the welcome bonus — playable and
        // spotlighted. Everything from Leçon 03 on stays locked.
        freeLessons={FREE_BONUS_LESSONS}
        onLockedLessonClick={() => setLockedPrompt(true)}
      />

      {/* Tapping any locked lesson (everything from Leçon 03 on)
          opens this small candy popup; "Confirmer" stays on /zero and reveals
          the existing ConfirmRegistration flow below the path. */}
      <Dialog open={lockedPrompt} onOpenChange={setLockedPrompt}>
        <DialogContent className="w-[min(20rem,calc(100vw-2.5rem))] rounded-[1.75rem] border-2 border-primary/15 bg-card p-6 text-center shadow-sticker">
          <div className="node-gloss mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-node text-primary-foreground shadow-sticker">
            <Lock className="h-6 w-6" />
          </div>
          <DialogTitle className="text-sm font-semibold leading-relaxed text-foreground">
            Les Leçons 01 et 02 sont offertes. Confirmez votre inscription pour débloquer la Leçon
            03 et tout le parcours.
          </DialogTitle>
          <button
            type="button"
            onClick={() => {
              setLockedPrompt(false);
              setShowConfirm(true);
            }}
            className="bonus-shimmer w-full rounded-full bg-gradient-brand px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-primary-foreground shadow-sticker-soft transition-transform hover:scale-[1.03] active:translate-y-0.5"
          >
            Confirmer
          </button>
        </DialogContent>
      </Dialog>

      {showConfirm && (
        <div ref={confirmRef} className="flex flex-col gap-5 px-4 py-6">
          <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-card/95 px-4 py-3 text-sm text-foreground shadow-sticker-soft">
            <Unlock className="h-4 w-4 shrink-0 text-primary" />
            Vous avez un accès gratuit — confirmez votre inscription ci-dessous pour débloquer
            leçons, suivi de progression, badges et ressources.
          </div>

          <ConfirmRegistration displayName={displayName} />

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm sm:flex-row">
            <Link
              to="/tarifs"
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Sparkles className="h-4 w-4" />
              Voir aussi le programme intensif en groupe
            </Link>
          </div>
        </div>
      )}
    </MemberAppShell>
  );
}
