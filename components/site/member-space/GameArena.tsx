import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Flame, Gem, type LucideIcon, Trophy } from "lucide-react";
import { PageHero, Reveal, InteractiveCard } from "@/components/site/shared";
import { GAME_MODES, type GameAccent } from "@/routes/jeux.content";

const ACCENT_STYLES: Record<GameAccent, { badge: string; hover: string }> = {
  sky: { badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400", hover: "hover:border-sky-400/50" },
  amber: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    hover: "hover:border-amber-400/50",
  },
  violet: {
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    hover: "hover:border-violet-400/50",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    hover: "hover:border-emerald-400/50",
  },
  rose: {
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    hover: "hover:border-rose-400/50",
  },
  orange: {
    badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    hover: "hover:border-orange-400/50",
  },
};

/**
 * The Game Arena screen. Same content the standalone /jeux page used to
 * render on its own; it now lives inside the member app body (see
 * src/routes/jeux.tsx) so opening the Game Arena tab keeps the app shell
 * (top bar + bottom tabs) instead of leaving for a separate website page.
 */
export function GameArena({
  streakDays = 0,
  homeHref = "/mon-espace",
}: {
  streakDays?: number;
  homeHref?: string;
}) {
  return (
    <>
      <PageHero
        eyebrow="🎮 New Arena Unlocked"
        title={
          <>
            Welcome to the <span className="text-gradient-brand">Game Arena</span>
          </>
        }
        subtitle="Mianara amin'ny fomba mahafinaritra kokoa — kilalao fohy mifandray amin'ny lesona HiT START."
      />

      <section className="mx-auto max-w-5xl px-5 pb-10 md:px-8">
        {/* Session summary strip */}
        <Reveal>
          <div className="grid grid-cols-3 gap-3 rounded-3xl border border-border bg-card/70 p-4 shadow-card backdrop-blur sm:p-6">
            <StatPill icon={Gem} value="0 XP" label="Today" />
            <StatPill icon={Flame} value={streakDays} label="Day streak" />
            <StatPill icon={Trophy} value={GAME_MODES.length} label="Coming up" />
          </div>
        </Reveal>

        {/* Game mode grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {GAME_MODES.map((game, i) => {
            const accent = ACCENT_STYLES[game.accent];
            const Icon = game.icon;
            const isPlayable = game.status === "available";

            const body = (
              <div
                className={`group h-full rounded-3xl border bg-card/60 p-6 shadow-card transition-colors ${
                  isPlayable ? "border-solid border-border bg-card" : "border-dashed border-border"
                } ${accent.hover}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.badge}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                    +{game.xp} XP
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                  {game.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink-soft">{game.tagline}</p>
                {isPlayable ? (
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow-elegant transition group-hover:gap-2.5">
                    Milalao
                    <ArrowRight className="h-3.5 w-3.5" />
                  </p>
                ) : (
                  <p className="mt-4 inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Coming soon
                  </p>
                )}
              </div>
            );

            return (
              <Reveal key={game.id} delay={i * 60}>
                <InteractiveCard className="h-full rounded-3xl">
                  {isPlayable ? (
                    <Link to="/jeux/flashcards" className="block h-full">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </InteractiveCard>
              </Reveal>
            );
          })}
        </div>

        {/* Back nav */}
        <div className="mt-10 flex justify-center">
          <Link
            to={homeHref}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Link>
        </div>
      </section>
    </>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl px-2 py-1 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-display text-xl font-extrabold text-foreground">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
    </div>
  );
}

export default GameArena;
