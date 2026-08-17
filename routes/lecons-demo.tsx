import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpenCheck,
  Flame,
  Gamepad2,
  GraduationCap,
  Lock,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { PageHero, Reveal, InteractiveCard } from "@/components/site/shared";

/**
 * /lecons-demo — hub of demo-content categories ("boxes").
 *
 * Used to redirect straight to /lecon-demo-18 (the single HiT START demo
 * lesson). Now it's a real hub: the HiT START demo and the new "Expression
 * du jour" category are live, and a handful of upcoming categories show as
 * locked placeholders so the page reads as an expanding library rather than
 * a fixed, finished list. New categories can be appended to CATEGORIES
 * below without touching anything else on the page.
 */
export const Route = createFileRoute("/lecons-demo")({
  head: () => ({
    meta: [
      { title: "Leçons démo gratuites | HiTako Academy" },
      {
        name: "description",
        content:
          "Essayez gratuitement la méthode HiTako Academy : une leçon HiT START complète, une nouvelle expression américaine chaque jour, et bientôt plus.",
      },
      { property: "og:title", content: "Leçons démo — HiTako Academy" },
      {
        property: "og:description",
        content: "Plusieurs façons gratuites de découvrir HiTako Academy avant de vous inscrire.",
      },
    ],
  }),
  component: LeconsDemoHub,
});

type Category = {
  emoji: string;
  title: string;
  blurb: string;
  meta: string;
  href?: string;
  cta?: string;
  icon: LucideIcon;
};

const CATEGORIES: Category[] = [
  {
    emoji: "🌟",
    title: "Leçon démo HiT START",
    blurb:
      "Une leçon complète du programme HiT START — histoire, dialogue, vocabulaire, prononciation, exercices et mission réelle.",
    meta: "1 leçon complète · ~15 min",
    href: "/lecon-demo-18",
    cta: "Essayer la leçon",
    icon: GraduationCap,
  },
  {
    emoji: "🇺🇸",
    title: "Expression du jour",
    blurb:
      "Une nouvelle expression américaine à apprendre chaque jour, expliquée en malgache — écoute, prononciation, mise en pratique.",
    meta: "Nouveau · 1 expression disponible",
    href: "/expression-du-jour",
    cta: "Découvrir",
    icon: MessagesSquare,
  },
  {
    emoji: "🔥",
    title: "Motivation",
    blurb: "De courtes leçons pour rester motivé et construire une vraie habitude d'apprentissage.",
    meta: "Bientôt disponible",
    icon: Flame,
  },
  {
    emoji: "🎮",
    title: "Jeux & défis",
    blurb: "Des mini-jeux gratuits pour réviser le vocabulaire et la prononciation en s'amusant.",
    meta: "Bientôt disponible",
    icon: Gamepad2,
  },
  {
    emoji: "📖",
    title: "Grammaire express",
    blurb: "Les points de grammaire les plus utiles, expliqués simplement en malgache.",
    meta: "Bientôt disponible",
    icon: BookOpenCheck,
  },
];

function LeconsDemoHub() {
  return (
    <>
      <PageHero
        eyebrow="100% gratuit"
        title={
          <>
            Découvrez HiTako, <span className="text-gradient-brand">sans engagement</span>.
          </>
        }
        subtitle="Plusieurs façons gratuites d'essayer la méthode HiTako Academy avant de vous inscrire — de nouvelles catégories arrivent régulièrement."
      />

      <section className="px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.title} delay={i * 60}>
                <CategoryCard category={c} />
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-6 text-center">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="max-w-md text-sm text-foreground">
              De nouvelles leçons démo sont ajoutées régulièrement. Créez un compte gratuit pour
              être averti dès qu'une nouvelle catégorie est disponible.
            </p>
            <Link
              to="/free-registration"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
            >
              Créer mon compte gratuit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const locked = !category.href;
  const Icon = category.icon;

  const body = (
    <div
      className={`relative flex h-full flex-col rounded-3xl border p-6 transition-all ${
        locked
          ? "border-border bg-muted/30"
          : "border-border bg-card shadow-elegant hover:-translate-y-1 hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl ${
            locked
              ? "bg-muted text-muted-foreground"
              : "bg-gradient-brand text-primary-foreground shadow-glow"
          }`}
          aria-hidden
        >
          {locked ? <Lock className="h-5 w-5" /> : category.emoji}
        </div>
        {locked ? (
          <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Bientôt
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Icon className="h-3 w-3" /> Disponible
          </span>
        )}
      </div>

      <h3
        className={`mt-4 font-display text-xl font-extrabold ${locked ? "text-muted-foreground" : "text-foreground"}`}
      >
        {category.title}
      </h3>
      <p
        className={`mt-2 flex-1 text-sm leading-relaxed ${locked ? "text-muted-foreground" : "text-ink-soft"}`}
      >
        {category.blurb}
      </p>
      <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
        {category.meta}
      </div>

      {!locked && (
        <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {category.cta} <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </div>
  );

  if (locked) {
    return (
      <div aria-disabled className="cursor-not-allowed select-none opacity-80">
        {body}
      </div>
    );
  }

  return (
    <InteractiveCard className="h-full rounded-3xl">
      <Link to={category.href} className="block h-full">
        {body}
      </Link>
    </InteractiveCard>
  );
}
