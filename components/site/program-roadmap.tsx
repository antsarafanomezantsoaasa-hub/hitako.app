import { CheckCircle2, Compass, Milestone, Rocket, Target } from "lucide-react";
import { Reveal, InteractiveCard } from "@/components/site/shared";
import programHero from "@/assets/zero-program-hero.jpg";

/**
 * Curriculum roadmap for /zero, adapted from the "HiT START Program" e-mail.
 * Narrative copy (intro, section titles, outcomes checklist, CTA) stays in
 * Malagasy as written. Lesson topics and phase goals stay in English, since
 * that's what they were in the source e-mail — they're the target-language
 * content of the course itself, not something to translate.
 */

type Phase = {
  phase: string;
  range: string;
  title: string;
  topics: string[];
  goal: string;
};

const PHASES: Phase[] = [
  {
    phase: "Phase 1",
    range: "Lesona 1–20",
    title: "Foundation",
    topics: [
      "Greetings",
      "Introductions",
      "Numbers",
      "Family",
      "Basic questions",
      "Everyday English",
    ],
    goal: "Understand and use very basic English phrases in everyday life.",
  },
  {
    phase: "Phase 2",
    range: "Lesona 21–40",
    title: "Basic Communication",
    topics: ["Daily routines", "Shopping", "Food", "Transport", "Hobbies", "Invitations"],
    goal: "Introduce yourself, talk about daily life, ask simple questions, and request help.",
  },
  {
    phase: "Phase 3",
    range: "Lesona 41–60",
    title: "Practical English",
    topics: [
      "Messages",
      "Emails",
      "Phone calls",
      "Customer service",
      "Work English",
      "Appointments",
    ],
    goal: "Use English in practical situations: messages, phone calls, appointments, customer service, daily work, and online communication.",
  },
  {
    phase: "Phase 4",
    range: "Lesona 61–80",
    title: "A2 Starter",
    topics: [
      "Future plans",
      "Past experiences",
      "Interviews",
      "Travel",
      "Hotel",
      "Professional conversations",
    ],
    goal: "Communicate in simple professional and real-life situations using present, past, future, polite requests, opinions, and basic problem-solving.",
  },
];

const OUTCOMES = [
  "Hampahafantatra ny tenanao",
  "Hiresaka amin'ny vahiny",
  "Hiantsena sy hanafatra sakafo",
  "Handefa mailaka sy hafatra",
  "Hanao antso",
  "Hanao interview",
];

export function ProgramRoadmap() {
  return (
    <div className="flex flex-col gap-6">
      {/* Intro + stats */}
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-border bg-card/70 shadow-card backdrop-blur">
          <img
            src={programHero}
            alt="Apprenants HiTako Academy souriants, réunis pour le programme HiT START"
            className="aspect-[1200/808] w-full object-cover"
            loading="lazy"
          />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                Ity no làlana harahinao mandritra ny programa.
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              Ao anatin'ny <strong>jusqu'à 6 volana</strong> dia hianatra teny Anglisy amin'ny fomba
              tsotra sy mora ampiharina ianao. Misy <strong>lesona 80</strong> izay tsy mandany
              afa-tsy 10 ka hatramin'ny 15 minitra isan'andro, natao hanampy anao hahatratra ny
              niveau <strong>A2 CEFR</strong>.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              Ny tanjona dia tsy ny hampianatra anao teny Anglisy fotsiny, fa ny hanome anao
              fahaizana afaka ampiasaina amin'ny fiainana andavanandro sy any am-piasana.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5 text-center">
              {[
                { k: "6", v: "volana" },
                { k: "80", v: "lesona" },
                { k: "A2", v: "niveau CEFR" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-2xl font-extrabold text-gradient-brand md:text-3xl">
                    {s.k}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-soft">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Phases */}
      <div className="grid gap-5 md:grid-cols-2">
        {PHASES.map((p, i) => (
          <Reveal key={p.phase} delay={i * 80}>
            <InteractiveCard className="h-full rounded-3xl">
              <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
                    <Milestone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                      {p.phase} — {p.range}
                    </p>
                    <h4 className="font-display text-base font-bold text-foreground">{p.title}</h4>
                  </div>
                </div>

                <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {p.topics.map((t) => (
                    <li key={t} className="flex items-start gap-1.5 text-xs text-ink-soft">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 px-3 py-2.5 text-xs text-foreground/80">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="italic">{p.goal}</span>
                </div>
              </div>
            </InteractiveCard>
          </Reveal>
        ))}
      </div>

      {/* Outcomes + CTA */}
      <Reveal delay={80}>
        <div className="rounded-3xl bg-gradient-brand p-6 text-center text-primary-foreground shadow-elegant md:p-8">
          <h3 className="font-display text-xl font-bold md:text-2xl">
            Inona no hainao aorian'ny HiT START?
          </h3>
          <ul className="mx-auto mt-5 grid max-w-md gap-2.5 text-left sm:grid-cols-1">
            {OUTCOMES.map((o) => (
              <li
                key={o}
                className="flex items-center gap-2.5 rounded-xl bg-white/12 px-4 py-2.5 text-sm font-medium backdrop-blur"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {o}
              </li>
            ))}
          </ul>
          <a
            href="#hamafiso"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-elegant transition-transform hover:scale-[1.02]"
          >
            <Rocket className="h-4 w-4" />
            Manomboka ny Alatsinainy ny fianarana
          </a>
        </div>
      </Reveal>
    </div>
  );
}
