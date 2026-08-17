import type { LucideIcon } from "lucide-react";
import type { MemberLevel } from "@/hooks/use-auth";

/**
 * Shared building blocks for the /mon-espace member area.
 *
 * These used to live inline in the single src/routes/mon-espace.tsx file
 * that rendered every section behind client-side tab-switching. Now that
 * each section is its own route under src/routes/mon-espace/*, the pieces
 * more than one of them needs (or that has no other natural home) live
 * here instead of being copy-pasted into every route file.
 */

// Full HiT START → HiT FLOW → HiT PRO curriculum size — used by both the
// "My HQ" home (lesson path) and "My Progress" (goal mini-stat).
// Kept in sync with the same constant on /admin.
export const TOTAL_CURRICULUM_LESSONS = 80;

// How many of the 80 HiT START lessons are actually published/playable today.
// Lesson 01 (src/routes/lecon-01.tsx) and Lesson 02 (src/routes/lecon-02.tsx)
// are real content right now — the rest is rolled out progressively by the
// teaching team. Used by the LessonPath node states so "done / current /
// locked" never drifts out of sync with what's actually built.
export const PUBLISHED_LESSON_COUNT = 2;

// Route for each published lesson, keyed by lesson number. LessonPath looks
// a node's number up here instead of hardcoding "n === 1 ? '/lecon-01' :
// undefined" — so publishing lesson N+1 is just adding one line here (plus
// bumping PUBLISHED_LESSON_COUNT above) rather than editing routing logic.
// A number with no entry (anything > PUBLISHED_LESSON_COUNT) simply has no
// route yet, same as before.
export const LESSON_ROUTES: Partial<Record<number, string>> = {
  1: "/lecon-01",
  2: "/lecon-02",
};

// HiT START's 80 lessons grouped into the 4 real curriculum phases from the
// public /zero roadmap (see src/components/site/program-roadmap.tsx's
// PHASES) — reused here so the "My HQ" lesson path shows the same chapter
// names/ranges as the marketing roadmap instead of inventing new ones.
export const CURRICULUM_CHAPTERS: { name: string; from: number; to: number }[] = [
  { name: "Foundation", from: 1, to: 20 },
  { name: "Basic Communication", from: 21, to: 40 },
  { name: "Practical English", from: 41, to: 60 },
  { name: "A2 Starter", from: 61, to: 80 },
];

// Per-level title + description, shown on the "My HQ" path (current level
// banner) and as "coming soon" teaser cards for the two levels that don't
// have lessons yet. Moved here (from src/routes/mon-espace/index.tsx) so
// LessonPath can reuse the exact same copy instead of duplicating it.
export const LEVEL_COPY: Record<MemberLevel, { title: string; description: string }> = {
  "HiT START": {
    title: "You're at HiT START level",
    description:
      "English foundations: pronunciation, everyday vocabulary and your first conversations.",
  },
  "HiT FLOW": {
    title: "You're at HiT FLOW level",
    description:
      "Fluency and confidence speaking: advanced structures, discussions and professional communication.",
  },
  "HiT PRO": {
    title: "You're at HiT PRO level",
    description:
      "Professional mastery: presentations, negotiation and business English applied to your career.",
  },
};

export function PlaceholderCard({
  icon: Icon,
  title,
  description,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed border-border bg-card/50 p-5 shadow-card backdrop-blur sm:p-6 ${className}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <p className="mt-4 inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Coming soon
      </p>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
