import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Flame, Heart, Zap } from "lucide-react";
import { PageHero, Reveal } from "@/components/site/shared";

/**
 * /motivation — Motivation lessons to build learning habits.
 *
 * Short, inspiring lessons designed to keep learners engaged and motivated
 * on their learning journey.
 */
export const Route = createFileRoute("/motivation")({
  head: () => ({
    meta: [
      { title: "Leçons de motivation | HiTako Academy" },
      {
        name: "description",
        content: "Des leçons courtes pour rester motivé et construire une vraie habitude d'apprentissage.",
      },
    ],
  }),
  component: MotivationHub,
});

type MotivationLesson = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  color: string;
};

const MOTIVATION_LESSONS: MotivationLesson[] = [
  {
    id: "why-learn-english",
    title: "Pourquoi apprendre l'anglais ?",
    subtitle: "Trouvez votre raison",
    description:
      "Découvrez les vraies raisons pour lesquelles l'apprentissage de l'anglais peut transformer votre vie personnelle et professionnelle. Une leçon courte, inspirante et pleine d'exemples concrets.",
    icon: "🌍",
    duration: "5-7 min",
    color: "from-amber-400/20 to-amber-400/5",
  },
  {
    id: "small-wins",
    title: "Les petites victoires",
    subtitle: "Célébrez vos progrès",
    description:
      "Chaque jour compte. Apprenez à reconnaître vos progrès, même les plus petits, et à les célébrer. C'est comme ça qu'on crée une vraie habitude d'apprentissage.",
    icon: "⭐",
    duration: "4-6 min",
    color: "from-yellow-400/20 to-yellow-400/5",
  },
  {
    id: "consistency",
    title: "La magie de la consistance",
    subtitle: "15 minutes par jour = résultats",
    description:
      "Vous n'avez pas besoin de 3 heures. 15 minutes par jour, c'est suffisant. Découvrez comment la régularité surpasse l'intensité, et comment construire une routine qui tient.",
    icon: "🔥",
    duration: "6-8 min",
    color: "from-orange-400/20 to-orange-400/5",
  },
  {
    id: "overcome-plateaus",
    title: "Surmonter les plateaux",
    subtitle: "Comment progresser quand ça stagne",
    description:
      "Le progrès n'est pas toujours linéaire. Apprenez les stratégies pour sortir des phases de stagnation et continuer à progresser vers votre objectif.",
    icon: "🚀",
    duration: "7-9 min",
    color: "from-blue-400/20 to-blue-400/5",
  },
];

function MotivationHub() {
  return (
    <>
      <PageHero
        eyebrow="Leçons courtes"
        title={
          <>
            Restez motivé, <span className="text-gradient-brand">progressez ensemble</span>.
          </>
        }
        subtitle="Des leçons de 5 à 10 minutes conçues pour nourrir votre motivation et construire une vraie habitude d'apprentissage."
      />

      <section className="px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-5 sm:grid-cols-2">
            {MOTIVATION_LESSONS.map((lesson, i) => (
              <Reveal key={lesson.id} delay={i * 60}>
                <MotivationCard lesson={lesson} />
              </Reveal>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center">
            <Flame className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-xl font-extrabold text-foreground">
              Construisez votre habitude
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
              Chaque leçon vous donne une raison de plus de vous engager dans votre apprentissage.
              Plus vous apprenez, plus vous voyez les résultats.
            </p>

            <Link
              to="/lecons-demo"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-surface-glass px-6 py-3 text-sm font-semibold text-primary backdrop-blur transition-colors hover:bg-card"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux leçons
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function MotivationCard({ lesson }: { lesson: MotivationLesson }) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-elegant transition-all hover:-translate-y-1 hover:border-primary/30`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${lesson.color} pointer-events-none`} />

      <div className="relative z-10 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl">
            {lesson.icon}
          </div>
        </div>

        <h3 className="mt-4 font-display text-lg font-extrabold text-foreground">
          {lesson.title}
        </h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {lesson.subtitle}
        </p>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
          {lesson.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">⏱️ {lesson.duration}</span>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary opacity-60 cursor-not-allowed"
          >
            Bientôt <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
