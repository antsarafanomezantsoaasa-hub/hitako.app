import { useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import MemberAppShell from "@/components/site/member-space/MemberAppShell";
import { GameArena } from "@/components/site/member-space/GameArena";
import { getFreeHomeHref } from "@/lib/free-tier";

export const Route = createFileRoute("/jeux")({
  head: () => ({
    meta: [
      { title: "Game Arena | HiTako Academy" },
      {
        name: "description",
        content:
          "Learn the fun way — bite-sized games linked to your HiT START lessons. Play, practice, and earn real XP.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GamesHubPage,
});

/**
 * /jeux — The Game Arena.
 * Rendered inside the member app shell (same body as /mon-espace and /zero)
 * so the Game Arena tab stays in the app instead of sending the learner to a
 * separate website page. Routing, auth gating and the game content itself
 * are unchanged — only the surrounding chrome moved.
 */
function GamesHubPage() {
  const navigate = useNavigate();
  const { loading, user, profile, role, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/connexion" });
  }, [loading, user, navigate]);

  const displayName = useMemo(
    () => profile?.full_name?.trim() || user?.email?.split("@")[0] || "Membre",
    [profile, user],
  );

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const homeHref = role === "free" ? getFreeHomeHref(profile?.preferred_format) : "/mon-espace";

  return (
    <MemberAppShell
      profile={profile}
      user={user}
      displayName={displayName}
      onSignOut={handleSignOut}
      homeHref={homeHref}
    >
      <GameArena streakDays={profile?.streak_days ?? 0} homeHref={homeHref} />
    </MemberAppShell>
  );
}
