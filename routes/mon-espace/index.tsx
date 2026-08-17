import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LessonPath } from "@/components/site/member-space/LessonPath";

export const Route = createFileRoute("/mon-espace/")({
  head: () => ({
    meta: [{ title: "My HQ | HiTako Academy" }],
  }),
  component: MyHqPage,
});

/**
 * "My HQ" — the app-mockup home screen (mon-espace-app-mockup.html): the
 * lesson path *is* the screen, filling everything between the shell's top
 * bar (avatar, streak, START, daily phrase) and the bottom tab bar.
 *
 * Stats, progress bars and level copy are not duplicated here — they live on
 * their own tabs (/mon-espace/progress), exactly as the mockup's tab bar
 * implies. Only the 5 most recent lessons render at first; scrolling up the
 * trail keeps revealing the rest (see LessonPath).
 *
 * The layout route (src/routes/mon-espace.tsx) already gates on
 * loading/user/profile/role before this ever mounts, so profile is
 * guaranteed here — the guard below is just cheap insurance against a
 * render in-between (e.g. right as a sign-out kicks off).
 */
function MyHqPage() {
  const { user, profile } = useAuth();
  if (!profile || !user) return null;

  return (
    // Cancels the shell's content padding so the path runs edge to edge like
    // the mockup's screen viewport.
    <div className="-mx-4 -my-5">
      <LessonPath
        variant="screen"
        level={profile.level}
        completedCount={profile.lessons_completed}
      />
    </div>
  );
}
