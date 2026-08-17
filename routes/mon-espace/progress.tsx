import { createFileRoute } from "@tanstack/react-router";
import { Award, CheckCircle2, Clock, Target, TrendingUp } from "lucide-react";
import { useAuth, type MemberLevel } from "@/hooks/use-auth";
import {
  MiniStat,
  PlaceholderCard,
  TOTAL_CURRICULUM_LESSONS,
} from "@/components/site/member-space/shared";

export const Route = createFileRoute("/mon-espace/progress")({
  head: () => ({
    meta: [{ title: "My Progress | HiTako Academy" }],
  }),
  component: MyProgressPage,
});

// Same insurance as the other child routes — the parent layout
// (src/routes/mon-espace.tsx) already gates on profile being loaded.
function MyProgressPage() {
  const { profile } = useAuth();
  if (!profile) return null;

  const steps: { level: MemberLevel; label: string }[] = [
    { level: "HiT START", label: "Foundations & first exchanges" },
    { level: "HiT FLOW", label: "Fluency & speaking confidence" },
    { level: "HiT PRO", label: "Advanced professional English" },
  ];
  const currentIdx = steps.findIndex((s) => s.level === profile.level);

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-card backdrop-blur sm:p-6 md:p-8">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 shrink-0 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            Your progress
          </h2>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Level {profile.level}</span>
            <span className="font-semibold text-foreground">{profile.progress_percent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-brand"
              style={{ width: `${profile.progress_percent}%` }}
            />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Lessons done" value={profile.lessons_completed} />
          <MiniStat label="Study time" value={`${profile.study_minutes} min`} />
          <MiniStat label="Streak" value={`${profile.streak_days} d`} />
          <MiniStat
            label="Goal"
            value={`${profile.lessons_completed}/${TOTAL_CURRICULUM_LESSONS}`}
          />
        </div>
      </div>

      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          return (
            <li
              key={s.level}
              className={`flex items-center gap-3 rounded-2xl border p-4 sm:gap-4 sm:p-5 ${
                current
                  ? "border-primary/40 bg-primary/5"
                  : done
                    ? "border-border bg-card/60"
                    : "border-dashed border-border bg-background/50"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  done
                    ? "bg-gradient-brand text-primary-foreground"
                    : current
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{s.level}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              {current && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  In progress
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Placeholder cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard
          icon={TrendingUp}
          title="Progress graphs"
          description="Visualize your growth over time."
        />
        <PlaceholderCard
          icon={Clock}
          title="History"
          description="A timeline of everything you've completed."
        />
        <PlaceholderCard
          icon={Award}
          title="Objectives & stats"
          description="Set goals and track detailed statistics."
        />
      </div>
    </div>
  );
}
