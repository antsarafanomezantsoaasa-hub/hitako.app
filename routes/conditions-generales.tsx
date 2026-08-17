import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/shared";
import { FinalCta } from "@/components/site/sections";
import {
  TERMS_ACCEPTANCE,
  TERMS_INTRO,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
  TERMS_TRANSLATION_NOTE,
} from "./conditions-generales.content";

export const Route = createFileRoute("/conditions-generales")({
  head: () => ({
    meta: [
      { title: "Conditions Générales | HiTako Academy" },
      {
        name: "description",
        content:
          "Conditions Générales d'HiTako Academy : inscription, paiement, accès aux programmes, remboursement, propriété intellectuelle et confidentialité.",
      },
      { property: "og:title", content: "Conditions Générales — HiTako Academy" },
      {
        property: "og:description",
        content:
          "Le règlement officiel qui encadre l'inscription, le paiement et la participation aux programmes HiTako Academy.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Document légal"
        title={
          <>
            Conditions <span className="text-gradient-brand">Générales</span>
          </>
        }
        subtitle={`Dernière mise à jour : ${TERMS_LAST_UPDATED}. Ce document régit l'inscription, le paiement, l'accès et la participation aux programmes HiTako Academy.`}
      />

      <section className="relative py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
            {/* Table of contents — desktop only; on mobile the document just
                reads top to bottom, which is plenty for a linear legal text. */}
            <aside className="hidden lg:block">
              <nav className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-soft">
                  Sommaire
                </p>
                <ol className="space-y-1 text-sm">
                  {TERMS_SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="block rounded-lg px-2.5 py-1.5 leading-snug text-ink-soft transition hover:bg-secondary hover:text-primary"
                      >
                        {s.number}. {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <div className="min-w-0">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
                {TERMS_INTRO.map((paragraph, i) => (
                  <p
                    key={i}
                    className={`text-sm leading-relaxed text-ink-soft md:text-base ${i > 0 ? "mt-3" : ""}`}
                  >
                    {paragraph}
                  </p>
                ))}
                <p className="mt-4 border-t border-border pt-4 text-xs italic leading-relaxed text-ink-soft/80">
                  {TERMS_TRANSLATION_NOTE}
                </p>
              </div>

              <div className="mt-10 space-y-10">
                {TERMS_SECTIONS.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-28">
                    <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
                      <span className="text-gradient-brand">{section.number}.</span> {section.title}
                    </h2>
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft md:text-base">
                      {section.blocks.map((block, i) =>
                        block.type === "p" ? (
                          <p key={i}>{block.text}</p>
                        ) : (
                          <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-primary">
                            {block.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-elegant md:p-8">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-display text-lg font-bold">Acceptation</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/90">{TERMS_ACCEPTANCE}</p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-xs font-semibold uppercase tracking-widest text-ink-soft">
                HiTako Academy — Learn · Grow · Succeed
              </p>
            </div>
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
