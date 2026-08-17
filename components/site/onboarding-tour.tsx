import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Compass, Flame, Sparkles, X } from "lucide-react";
import { useHydrated } from "./shared";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * First-visit guided tour for the public homepage.
 *
 * A visitor who has never seen it gets a short welcome popup ("Bienvenue…
 * Découvrons ensemble les points essentiels du site !"). Tapping "Commencer"
 * starts a step-by-step walkthrough that scrolls to and spotlights each
 * essential element of "/" (see STEPS below), with Previous/Next controls,
 * until the last step ("Terminer"). The whole thing is shown at most once —
 * see STORAGE_KEY.
 */

const STORAGE_KEY = "hitako-tour-seen-v1";
const SPOTLIGHT_PAD = 10;
const WELCOME_DELAY_MS = 1400;

type TourStep = {
  id: string;
  /** Matches a `data-tour="…"` attribute somewhere on the page. */
  target: string;
  title: string;
  body: string;
  tip?: string;
};

const STEPS: TourStep[] = [
  {
    id: "hero-cta",
    target: "hero-cta",
    title: "Le bouton le plus important",
    body: "« Commencer à apprendre » vous mène directement à la création de votre compte gratuit — le point de départ de votre parcours HiTako.",
    tip: "Cliquez ici dès que vous êtes prêt à démarrer, à votre rythme.",
  },
  {
    id: "nav-links",
    target: "nav-links",
    title: "Le menu, votre boussole",
    body: "Retrouvez ici tous les repères essentiels du site : pourquoi apprendre l'anglais, nos programmes, les leçons démo, les tarifs, le test de niveau et la FAQ.",
  },
  {
    id: "demo-lesson",
    target: "demo-lesson",
    title: "Testez avant de vous engager",
    body: "Essayez une leçon de démo 100 % gratuite, sans carte bancaire, pour découvrir la méthode HiTako en action.",
    tip: "Comptez environ 15 minutes pour voir si la méthode vous correspond.",
  },
  {
    id: "transformation",
    target: "transformation",
    title: "Des progrès, pas des promesses",
    body: "Le but n'est pas seulement de terminer des leçons : c'est de pouvoir utiliser l'anglais. Chaque étape de la méthode HiTako est pensée pour vous y amener, à votre rythme.",
  },
  {
    id: "community",
    target: "community",
    title: "Une famille, pas juste une classe",
    body: "Rejoignez une communauté d'ambitieux Malgaches qui s'entraident, se motivent et célèbrent chaque victoire ensemble.",
  },
  {
    id: "stories",
    target: "stories",
    title: "Ils l'ont fait, vous aussi",
    body: "Découvrez comment d'autres apprenants HiT START ont gagné en confiance et transformé leur quotidien grâce à HiTako.",
  },
  {
    id: "final-cta",
    target: "final-cta",
    title: "Prêt à vous lancer ?",
    body: "Pas besoin d'attendre le moment parfait. Commencez avec une petite étape aujourd'hui, puis continuez à votre rythme.",
  },
];

function markSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private browsing / storage disabled — the tour will just show again */
  }
}

function hasSeenTour(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function isEffectivelyVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

/** Some steps have two candidate elements (desktop nav vs. mobile menu
 *  button) sharing the same data-tour id — pick whichever is on-screen. */
function findTarget(id: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`);
  for (const el of nodes) {
    if (isEffectivelyVisible(el)) return el;
  }
  return nodes[0] ?? null;
}

type Phase = "idle" | "welcome" | "step";

export function OnboardingTour() {
  const hydrated = useHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isMobile = useIsMobile();
  const isHome = pathname === "/";

  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const [arrowLeft, setArrowLeft] = useState<number | null>(null);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");

  const targetElRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Show the welcome popup once, the first time a visitor lands on "/".
  useEffect(() => {
    if (!hydrated || !isHome || hasSeenTour()) return;
    const t = setTimeout(() => {
      markSeen();
      setPhase("welcome");
    }, WELCOME_DELAY_MS);
    return () => clearTimeout(t);
  }, [hydrated, isHome]);

  // Bail out cleanly if the visitor navigates away mid-tour.
  useEffect(() => {
    if (!isHome && phase !== "idle") setPhase("idle");
  }, [isHome, phase]);

  const step = phase === "step" ? STEPS[stepIndex] : null;

  // Find, scroll to, and measure the current step's target.
  useEffect(() => {
    if (phase !== "step" || !step) return;
    const el = findTarget(step.target);
    if (!el) {
      // Target isn't in the current layout (e.g. hidden at this viewport
      // width) — skip it instead of stalling the tour.
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
      if (stepIndex >= STEPS.length - 1) setPhase("idle");
      return;
    }
    targetElRef.current = el;
    if (window.getComputedStyle(el).position !== "fixed") {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
    const measure = () => setRect(el.getBoundingClientRect());
    measure();
    const t1 = setTimeout(measure, 380);
    const t2 = setTimeout(measure, 650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, stepIndex, step]);

  // Keep the spotlight glued to its target through scroll/resize/reflow.
  useEffect(() => {
    if (phase !== "step") return;
    let raf = 0;
    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = targetElRef.current;
        if (el) setRect(el.getBoundingClientRect());
      });
    };
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
      cancelAnimationFrame(raf);
    };
  }, [phase]);

  // Position the tooltip card relative to the highlighted element
  // (desktop/tablet only — mobile uses a fixed bottom sheet instead).
  useLayoutEffect(() => {
    if (phase !== "step" || !rect || isMobile) {
      setTooltipPos(null);
      return;
    }
    const margin = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tw = tooltipRef.current?.offsetWidth ?? 360;
    const th = tooltipRef.current?.offsetHeight ?? 220;

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const nextPlacement: "top" | "bottom" =
      spaceBelow >= th + 28 || spaceBelow >= spaceAbove ? "bottom" : "top";
    setPlacement(nextPlacement);

    let top = nextPlacement === "bottom" ? rect.bottom + 20 : rect.top - th - 20;
    top = Math.min(Math.max(top, margin), Math.max(margin, vh - th - margin));

    let left = rect.left + rect.width / 2 - tw / 2;
    left = Math.min(Math.max(left, margin), Math.max(margin, vw - tw - margin));

    setTooltipPos({ top, left, width: tw });
    setArrowLeft(Math.min(Math.max(rect.left + rect.width / 2 - left, 28), tw - 28));
  }, [rect, isMobile, phase, stepIndex]);

  function next() {
    setStepIndex((i) => {
      if (i >= STEPS.length - 1) {
        setPhase("idle");
        return i;
      }
      return i + 1;
    });
  }
  function prev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }
  function startTour() {
    setStepIndex(0);
    setPhase("step");
  }
  function close() {
    setPhase("idle");
  }

  // Keyboard shortcuts while the tour is on screen.
  useEffect(() => {
    if (phase === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (phase === "step" && e.key === "ArrowRight") next();
      else if (phase === "step" && e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, stepIndex]);

  if (!hydrated || phase === "idle") return null;

  return createPortal(
    <>
      {phase === "welcome" && <WelcomeCard onStart={startTour} onSkip={close} />}

      {phase === "step" && step && (
        <>
          {/* Blocks interaction with the page behind the tour without
              visually darkening it itself — the spotlight box-shadow
              below handles the actual dimming. */}
          <div className="fixed inset-0 z-[95]" aria-hidden="true" />

          {rect && (
            <div
              className="pointer-events-none fixed z-[96] rounded-2xl transition-[top,left,width,height] duration-500 ease-out"
              style={{
                top: rect.top - SPOTLIGHT_PAD,
                left: rect.left - SPOTLIGHT_PAD,
                width: rect.width + SPOTLIGHT_PAD * 2,
                height: rect.height + SPOTLIGHT_PAD * 2,
                boxShadow:
                  "0 0 0 3px color-mix(in oklab, var(--primary) 80%, transparent), 0 0 34px 4px color-mix(in oklab, var(--primary-glow) 45%, transparent), 0 0 0 9999px rgba(8, 12, 24, 0.68)",
              }}
            />
          )}

          <StepCard
            ref={tooltipRef}
            step={step}
            index={stepIndex}
            total={STEPS.length}
            isMobile={isMobile}
            placement={placement}
            pos={tooltipPos}
            arrowLeft={arrowLeft}
            onNext={next}
            onPrev={prev}
            onClose={close}
          />
        </>
      )}
    </>,
    document.body,
  );
}

/* ---------- WELCOME POPUP ---------- */
function WelcomeCard({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="fixed inset-0 z-[97] flex items-center justify-center bg-ink/50 p-5 backdrop-blur-sm animate-fade-in-soft">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-elegant animate-pop-in md:p-8">
        <button
          onClick={onSkip}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-accent hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
          <Compass className="h-6 w-6" />
        </span>

        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink">
          Bienvenue sur HiTako Academy 👋
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Première visite ? Laissez-nous vous montrer, en moins d'une minute, tout ce qu'il faut
          savoir avant de vous lancer.
        </p>
        <p className="mt-2 text-sm font-semibold text-primary">
          Découvrons ensemble les points essentiels du site !
        </p>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            onClick={onSkip}
            className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            Passer
          </button>
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
          >
            Commencer
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- STEP TOOLTIP ---------- */
const StepCard = forwardRef<
  HTMLDivElement,
  {
    step: TourStep;
    index: number;
    total: number;
    isMobile: boolean;
    placement: "top" | "bottom";
    pos: { top: number; left: number; width: number } | null;
    arrowLeft: number | null;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
  }
>(function StepCard(
  { step, index, total, isMobile, placement, pos, arrowLeft, onNext, onPrev, onClose },
  ref,
) {
  const isLast = index === total - 1;
  const isFirst = index === 0;

  const positionStyle: CSSProperties = isMobile
    ? { left: 12, right: 12, bottom: "calc(12px + var(--safe-bottom, 0px))" }
    : {
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        width: pos?.width,
        visibility: pos ? "visible" : "hidden",
      };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Visite guidée — étape ${index + 1} sur ${total}`}
      className={`fixed z-[97] w-[min(92vw,380px)] rounded-3xl border border-border bg-card p-5 shadow-elegant animate-pop-in md:p-6 ${
        isMobile ? "max-h-[54vh] overflow-y-auto" : ""
      }`}
      style={positionStyle}
    >
      {!isMobile && arrowLeft !== null && pos && (
        <span
          aria-hidden="true"
          className="absolute h-3.5 w-3.5 rotate-45 border border-border bg-card"
          style={
            placement === "bottom"
              ? { top: -7, left: arrowLeft - 7, borderRight: "none", borderBottom: "none" }
              : { bottom: -7, left: arrowLeft - 7, borderLeft: "none", borderTop: "none" }
          }
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <h3 className="font-display text-base font-bold leading-snug text-ink">{step.title}</h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer la visite guidée"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-accent hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>

      {step.tip && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border-l-4 border-primary bg-primary/10 px-3 py-2.5">
          <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-xs font-semibold leading-relaxed text-primary">{step.tip}</p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-gradient-brand" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Précédent
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
          >
            {isLast ? (
              <>
                Terminer <Check className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Suivant <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
