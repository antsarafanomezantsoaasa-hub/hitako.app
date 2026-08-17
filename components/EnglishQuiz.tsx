import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Mail,
  Trophy,
  RotateCcw,
  Loader2,
  Clock,
  Save,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { QUESTIONS, levelFromScore, MILESTONES, type QuizLevel } from "./quizQuestions";
import { playCongratulations, playCorrect, playGameComplete, playWrong } from "@/lib/sound-fx";
import { submitQuizLead } from "@/lib/quiz-leads.functions";

const EMAIL_URL = "https://forms.gle/RYGdkaAo6MQKLnBn9";
const STORAGE_KEY = "hitako.quiz.progress";

type Phase = "intro" | "quiz" | "milestone" | "email" | "result";

type SavedProgress = {
  answers: (number | null)[];
  current: number;
  updatedAt: string;
};

export function EnglishQuiz() {
  const submitQuizLeadFn = useServerFn(submitQuizLead);
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(QUESTIONS.length).fill(null),
  );
  const [current, setCurrent] = useState(0);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Check for saved progress on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: SavedProgress = JSON.parse(raw);
        if (saved.answers?.length === QUESTIONS.length && saved.current > 0) {
          setHasSaved(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (phase === "quiz" || phase === "milestone") {
      try {
        const data: SavedProgress = { answers, current, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* ignore */
      }
    }
  }, [answers, current, phase]);

  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const score = useMemo(
    () =>
      answers.reduce<number>(
        (acc, a, i) => acc + (a !== null && a === QUESTIONS[i].answer ? 1 : 0),
        0,
      ),
    [answers],
  );
  const level = useMemo(() => levelFromScore(score), [score]);
  const progress = ((current + (answers[current] !== null ? 1 : 0)) / QUESTIONS.length) * 100;
  const estMinLeft = Math.max(1, Math.round(((QUESTIONS.length - current) * 15) / 60));

  useEffect(() => {
    if (phase !== "intro") {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase, current]);

  const startFresh = () => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setCurrent(0);
    setPhase("quiz");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setHasSaved(false);
  };

  const resume = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return startFresh();
      const saved: SavedProgress = JSON.parse(raw);
      setAnswers(saved.answers);
      setCurrent(saved.current);
      setPhase("quiz");
    } catch {
      startFresh();
    }
  };

  const pick = (idx: number) => {
    if (idx === QUESTIONS[current].answer) {
      playCorrect();
    } else {
      playWrong();
    }
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = idx;
      return next;
    });
    setTimeout(() => {
      const nextIdx = current + 1;
      if (nextIdx >= QUESTIONS.length) {
        playGameComplete();
        setPhase("email");
        return;
      }
      if (MILESTONES[nextIdx]) {
        playCongratulations();
        setMilestone(nextIdx);
        setPhase("milestone");
      } else {
        setCurrent(nextIdx);
      }
    }, 220);
  };

  const continueFromMilestone = () => {
    if (milestone !== null) setCurrent(milestone);
    setMilestone(null);
    setPhase("quiz");
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailErr(null);
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || trimmed.length > 254) {
      setEmailErr("Merci d'entrer une adresse e-mail valide.");
      return;
    }
    setSubmitting(true);
    try {
      // Persisted server-side (see src/lib/quiz-leads.functions.ts) so the
      // lead survives past this browser tab — it used to only be written to
      // localStorage, which meant every completed quiz was lost the moment
      // the visitor closed the page or cleared their cache.
      const result = await submitQuizLeadFn({
        data: { email: trimmed, score, total: QUESTIONS.length, level_code: level.code },
      });
      if (!result.ok) {
        console.error("[EnglishQuiz] submitQuizLead failed:", result.message);
      }
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // Fail open: a hiccup here shouldn't block a visitor from seeing the
      // score they just earned — worst case, this particular lead isn't
      // captured, same as every attempt before this fix.
      console.error("[EnglishQuiz] submitQuizLead threw:", err);
    }
    setSubmitting(false);
    setPhase("result");
  };

  const reset = () => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setCurrent(0);
    setEmail("");
    setEmailErr(null);
    setPhase("intro");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setHasSaved(false);
  };

  const currentQ = QUESTIONS[current];
  const levelBadge = (lvl: QuizLevel) => (
    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
      {lvl}
    </span>
  );

  return (
    <section id="quiz" className="relative scroll-mt-[72px] py-24">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Test CECRL officiel · 100 questions
          </span>
          <h2 className="mt-5 font-display text-4xl font-bold text-ink md:text-5xl">
            Quel est votre <span className="text-gradient-brand">niveau d'anglais</span> ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">
            100 questions calibrées A1 → C2. Environ 25-30 min. Votre progression est sauvegardée
            automatiquement — vous pouvez reprendre à tout moment.
          </p>
        </div>

        <div
          ref={cardRef}
          className="mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
        >
          {/* progress bar */}
          <div className="h-1.5 w-full bg-muted">
            <div
              className="h-full bg-gradient-brand transition-[width] duration-500 ease-out"
              style={{
                width:
                  phase === "intro"
                    ? "0%"
                    : phase === "quiz" || phase === "milestone"
                      ? `${progress}%`
                      : phase === "email"
                        ? "98%"
                        : "100%",
              }}
            />
          </div>

          <div className="p-6 md:p-10">
            {phase === "intro" && (
              <div className="animate-fade-up text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-ink md:text-3xl">
                  Prêt·e à découvrir votre vrai niveau CECRL ?
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-ink-soft">
                  Grammaire, temps, conditionnels, passif, modaux, expressions. À la fin, vous
                  recevrez votre <strong className="text-ink">niveau CECRL détaillé</strong> et la
                  newsletter <strong className="text-ink">HiTako Daily English</strong> — 5 min/jour
                  pour progresser.
                </p>

                <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <Clock className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-1 font-semibold text-ink">~25 min</p>
                    <p className="text-ink-soft">durée</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <Save className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-1 font-semibold text-ink">Auto-save</p>
                    <p className="text-ink-soft">reprenez plus tard</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <Trophy className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-1 font-semibold text-ink">A1 → C2</p>
                    <p className="text-ink-soft">niveau précis</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  {hasSaved && (
                    <button
                      onClick={resume}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-background px-7 py-3.5 font-semibold text-primary transition-transform hover:-translate-y-0.5"
                    >
                      Reprendre où j'en étais <ArrowRight className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={startFresh}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 hover:shadow-glow"
                  >
                    {hasSaved ? "Recommencer à zéro" : "Démarrer le test"}{" "}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-4 text-xs text-ink-soft">
                  Aucune inscription requise pour commencer.
                </p>
              </div>
            )}

            {phase === "milestone" && milestone !== null && (
              <div className="animate-pop-in text-center">
                <div className="mx-auto text-6xl">{MILESTONES[milestone].emoji}</div>
                <h3 className="mt-4 font-display text-2xl font-bold text-ink md:text-3xl">
                  {MILESTONES[milestone].title}
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-ink-soft">{MILESTONES[milestone].msg}</p>
                <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-soft">Progression</span>
                    <span className="font-bold text-ink">
                      {milestone} / {QUESTIONS.length}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-brand"
                      style={{ width: `${(milestone / QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
                    <span>⏱ ~{estMinLeft} min restantes</span>
                    <span>💾 Sauvegardé</span>
                  </div>
                </div>
                <button
                  onClick={continueFromMilestone}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Continuer <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {phase === "quiz" && (
              <div key={current} className="animate-fade-up">
                <div className="flex items-center justify-between text-sm text-ink-soft">
                  <div className="flex items-center gap-2">
                    <span>
                      Question {current + 1} / {QUESTIONS.length}
                    </span>
                    {levelBadge(currentQ.level)}
                  </div>
                  <span className="font-medium text-primary">{Math.round(progress)}%</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-ink md:text-2xl">
                  {currentQ.q}
                </h3>
                {currentQ.hint && (
                  <p className="mt-1 text-sm italic text-ink-soft">{currentQ.hint}</p>
                )}

                <div className="mt-6 grid gap-3">
                  {currentQ.options.map((opt, i) => {
                    const selected = answers[current] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => pick(i)}
                        className={[
                          "group flex items-center justify-between gap-3 rounded-2xl border-2 px-5 py-4 text-left transition-all",
                          selected
                            ? "border-primary bg-primary/10 shadow-card"
                            : "border-border bg-background hover:border-primary/40 hover:bg-muted/50",
                        ].join(" ")}
                      >
                        <span className="font-medium text-ink">{opt}</span>
                        <span
                          className={[
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border",
                          ].join(" ")}
                          aria-hidden
                        >
                          {selected && <Check className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    disabled={current === 0}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" /> Retour
                  </button>
                  <span className="text-xs text-ink-soft">
                    💾 {answeredCount} / {QUESTIONS.length} · ⏱ ~{estMinLeft} min
                  </span>
                </div>
              </div>
            )}

            {phase === "email" && (
              <form onSubmit={submitEmail} className="animate-fade-up text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-ink md:text-3xl">
                  Bravo, vous avez terminé les 100 questions ! 🎉
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-ink-soft">
                  Entrez votre e-mail pour recevoir votre niveau CECRL détaillé et intégrer
                  gratuitement la newsletter{" "}
                  <strong className="text-ink">HiTako Daily English</strong> : une astuce concrète
                  par jour, 5 min de lecture.
                </p>

                <div className="mx-auto mt-6 max-w-md">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      maxLength={254}
                      className="flex-1 rounded-full border border-border bg-background px-5 py-3.5 text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-70"
                    >
                      {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Voir mon score <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                  {emailErr && <p className="mt-3 text-sm text-destructive">{emailErr}</p>}
                  <p className="mt-4 text-xs text-ink-soft">
                    Zéro spam. Désinscription en 1 clic. Nous respectons votre vie privée.
                  </p>
                </div>
              </form>
            )}

            {phase === "result" && (
              <div className="animate-pop-in text-center">
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${level.color} text-white shadow-glow`}
                >
                  <Trophy className="h-10 w-10" />
                </div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-primary">
                  Votre niveau CECRL
                </p>
                <h3 className="mt-2 font-display text-5xl font-bold text-ink md:text-6xl">
                  {level.code}
                </h3>
                <p className="mt-2 text-xl font-medium text-ink">{level.title}</p>
                <p className="mx-auto mt-4 max-w-lg text-ink-soft">{level.blurb}</p>

                <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-background p-5">
                    <p className="text-3xl font-bold text-gradient-brand">
                      {score}/{QUESTIONS.length}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-ink-soft">
                      Bonnes réponses
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-5">
                    <p className="text-3xl font-bold text-gradient-brand">
                      {Math.round((score / QUESTIONS.length) * 100)}%
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-ink-soft">
                      Score global
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-left md:p-6">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold text-ink">
                        Bienvenue dans HiTako Daily English ✉️
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">
                        Votre premier e-mail arrive dans quelques minutes à{" "}
                        <strong className="text-ink">{email}</strong>. Chaque jour, une astuce
                        concrète adaptée à votre niveau {level.code}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={EMAIL_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 hover:shadow-glow"
                  >
                    Découvrir les programmes <ArrowRight className="h-5 w-5" />
                  </a>
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 font-medium text-ink transition-colors hover:bg-muted"
                  >
                    <RotateCcw className="h-4 w-4" /> Refaire le test
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
