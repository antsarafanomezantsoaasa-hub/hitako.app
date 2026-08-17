import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, LayoutDashboard, Moon, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const REGISTER_URL = "https://forms.gle/gSdE7kHGusuXW2L56";
export const EMAIL_URL = "https://forms.gle/RYGdkaAo6MQKLnBn9";

/* ---------- HOOKS ---------- */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      setP(height > 0 ? (scrolled / height) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("reveal-in");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function useCounter(target: number, duration = 1600, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

/* ---------- THEME CONTEXT ---------- */
type ThemeState = { theme: "light" | "dark"; toggle: () => void };
const ThemeCtx = createContext<ThemeState>({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const stored =
      (typeof window !== "undefined"
        ? (localStorage.getItem("hitako-theme") as "light" | "dark" | null)
        : null) ?? "light";
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);
  const toggle = () => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("hitako-theme", next);
      return next;
    });
  };
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 text-primary shadow-card backdrop-blur transition-all hover:scale-105 hover:shadow-elegant"
    >
      <Sun
        className={`h-[18px] w-[18px] transition-all ${theme === "dark" ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition-all ${theme === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`}
      />
    </button>
  );
}

/* ---------- REVEAL WRAPPER ---------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------- SCROLL PROGRESS ---------- */
export function ScrollProgress() {
  const p = useScrollProgress();
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1">
      <div
        className="h-full origin-left bg-gradient-brand shadow-glow transition-[width] duration-150 ease-out"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

/* ---------- FLOATING CTA ---------- */
export function FloatingCta() {
  const [visible, setVisible] = useState(false);
  const { user, loading } = useAuth();
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (loading) return null;
  if (user) {
    return (
      <Link
        to="/mon-espace"
        aria-label="Ouvrir mon espace"
        className={`group fixed right-4 z-[55] inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-all duration-500 md:right-8 ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
        style={{ bottom: "calc(1rem + var(--safe-bottom))" }}
      >
        <LayoutDashboard className="h-4 w-4" />
        Mon espace
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  }
  return (
    <Link
      to="/free-registration"
      aria-label="Commencer à apprendre"
      className={`group fixed right-4 z-[55] inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-all duration-500 md:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      style={{ bottom: "calc(1rem + var(--safe-bottom))" }}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      Commencer à apprendre
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ---------- ANIMATED COUNTER ---------- */
export function StatCounter({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState(false);
  const n = useCounter(value, 1600, start);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStart(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref}>
      <dt className="font-display text-4xl font-bold text-gradient-brand md:text-5xl">
        {n}
        {suffix}
      </dt>
      <dd className="mt-1 text-sm text-ink-soft">{label}</dd>
    </div>
  );
}

/* ---------- WAVE DIVIDER ---------- */
export function WaveDivider() {
  return (
    <svg
      className="block w-full"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,40 C240,80 480,0 720,30 C960,60 1200,20 1440,40 L1440,80 L0,80 Z"
        fill="url(#wg)"
        opacity="0.15"
      />
      <path
        d="M0,50 C240,90 480,10 720,40 C960,70 1200,30 1440,50"
        stroke="url(#wg)"
        strokeWidth="2.5"
        fill="none"
      />
      <defs>
        <linearGradient id="wg" x1="0" x2="1">
          <stop offset="0%" stopColor="oklch(0.52 0.24 262)" />
          <stop offset="100%" stopColor="oklch(0.78 0.15 230)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ---------- INTERACTIVE CARD ---------- */
export function InteractiveCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const rx = ((y - 50) / 50) * -6;
    const ry = ((x - 50) / 50) * 6;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--brand-sky) 25%, transparent), transparent 40%)",
        }}
      />
      {children}
    </div>
  );
}

/* ---------- PAGE HERO (small hero for interior pages) ---------- */
export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-hero">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-primary-glow/25 blur-[120px]" />
        <div className="absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full bg-primary/20 blur-[100px]" />
      </div>
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-14 text-center md:px-8 md:pb-24 md:pt-20">
        {eyebrow && (
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-6xl">
          {title}
        </h1>
        {subtitle && <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">{subtitle}</p>}
      </div>
      <WaveDivider />
    </section>
  );
}
