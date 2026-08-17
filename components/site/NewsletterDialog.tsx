import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { subscribeNewsletter } from "@/lib/newsletter.functions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Drop-in replacement for the old `<a href={EMAIL_URL}>` newsletter link.
 * Wrap it around whatever trigger markup already exists (icon + label) —
 * it renders that as the clickable trigger and owns the popup itself, so
 * every call site keeps its own button styling.
 *
 * `source` is just a short tag recorded server-side (see
 * newsletter.functions.ts) so leads can be told apart by where on the site
 * they signed up — it's never shown to the visitor.
 */
export function NewsletterDialog({
  children,
  className,
  source = "newsletter_popup",
}: {
  children: React.ReactNode;
  className?: string;
  source?: string;
}) {
  const subscribeFn = useServerFn(subscribeNewsletter);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset a beat after the close animation so the form doesn't visibly
      // flash back to empty while it's still fading out.
      setTimeout(() => {
        setEmail("");
        setErr(null);
        setDone(false);
      }, 200);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed) || trimmed.length > 254) {
      setErr("Merci d'entrer une adresse e-mail valide.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await subscribeFn({ data: { email: trimmed, source } });
      if (!result.ok) {
        setErr(result.message);
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch (err) {
      // Fail closed here (unlike the quiz): signing up is the entire point
      // of this popup, so if it didn't work the visitor should know and can
      // retry, rather than being shown a false "Merci !".
      console.error("[NewsletterDialog] subscribeNewsletter threw:", err);
      setErr("Impossible d'enregistrer votre e-mail pour le moment. Réessayez dans un instant.");
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-none bg-card p-0 shadow-elegant">
        <div className="relative overflow-hidden bg-gradient-brand px-6 pb-7 pt-9 text-center text-primary-foreground">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Mail className="h-6 w-6" />
          </div>
          <DialogHeader className="relative mt-4 space-y-1.5 text-center sm:text-center">
            <DialogTitle className="font-display text-xl font-bold text-white">
              Une leçon d'anglais dans ta boîte mail
            </DialogTitle>
            <DialogDescription className="text-sm text-white/85">
              Chaque semaine : un mot de vocabulaire, une astuce et une mini-leçon. Gratuit, court,
              et fait pour tenir dans le temps.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <p className="font-display text-lg font-bold text-ink">Tu es inscrit(e) ! 🎉</p>
              <p className="text-sm text-ink-soft">
                Surveille ta boîte mail — ta première leçon arrive très bientôt.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                <Sparkles className="h-3.5 w-3.5" /> 100% gratuit, sans engagement
              </p>
              <label htmlFor="newsletter-email" className="sr-only">
                Adresse e-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                placeholder="ton.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm text-ink outline-none transition-colors focus:border-primary"
                disabled={submitting}
              />
              {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Inscription...
                  </>
                ) : (
                  "Je m'abonne"
                )}
              </button>
              <p className="mt-3 text-center text-xs text-ink-soft">
                Pas de spam. Tu peux te désabonner à tout moment.
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
