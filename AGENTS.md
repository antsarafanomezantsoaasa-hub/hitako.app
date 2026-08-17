<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Baseline runs checklist (Stage 0)

Confirmed working on `feature/stage-0-baseline-and-tooling`, 2026-08-15.
Re-run this whenever touching `package.json`, `bun.lock`, `vite.config.ts`,
`supabase/migrations/`, or anything under `src/assets/` — those are the
pieces most likely to break the baseline again.

- [x] `.env` is git-ignored; `.env.example` documents every required key
      (see `.gitignore`, `.env.example`).
- [x] `bun install` succeeds standalone (no Lovable-sandbox network
      access required) — 202 packages, 0 errors.
- [x] `bun run dev` serves the homepage (200, no ENOENT/module-not-found).
      In an IPv6-less container, pass `--host 127.0.0.1` explicitly — see
      `KNOWN_ISSUES.md` #3.
- [x] `bun run build` completes clean and produces `.output/`.
- [ ] `bun run lint` — currently exits 1 (4 errors, 21 warnings, all
      pre-existing). See `KNOWN_ISSUES.md` #2.

Known gaps in this baseline (not blockers, but don't assume they're
fixed): the 13 placeholder images under `src/assets/` that still need
real files. Full detail in `ASSETS_TODO.md`.

The pending-splash/`useAuth` crash noted in earlier versions of this
file was fixed 2026-08-15 (Phase 0.5) — `AuthProvider` now wraps
`RootShell` instead of just `RootComponent`. See `KNOWN_ISSUES.md`
item 3 under "Fixed on this branch" for the verification done, and
item 1 under "Still open" for what's *not* yet verified (a live
Supabase instance, a real throttled connection).

## 2026-08-16 — Community/clubs/events messaging correction

Rewrote the homepage `Community()` section in
`src/components/site/sections.tsx` so it can't be read as "membership
= unlimited free physical events." App stays framed as the core
product ("L'application reste le cœur de ton apprentissage"),
community as a supporting layer, and a new sub-block explicitly notes
that clubs/rencontres/sorties/activités may require a separate ticket
or registration, with a visible (not fine-print) "🎟️ Certains
événements nécessitent un ticket séparé." note. No pricing structure
changed. `MembershipValue()`, `Faq()`, `Nav.tsx`, and the onboarding
tour copy were checked and did not need changes — none of them made
an "everything is free" claim about clubs/events.

## 2026-08-16 — Homepage FAQ upgrade (8 required questions)

`Faq()` in `src/components/site/sections.tsx` is shared by `/` and
`/faq`, but the two need different content, so it now takes an
optional `faqs` prop (defaulting to `PROGRAM_FAQS`, the original
HiT START-focused list — byte-identical to before, so `/faq` is
unchanged). Added `HOME_FAQS` (exported) with the 8 required
homepage questions — beginner-friendliness, daily time, fixed
schedule, mobile access, what's included, clubs/events ticketing
(exact required copy), practicing with peers, and a credible
no-guaranteed-fluency answer. `src/routes/index.tsx` now imports
`HOME_FAQS` and renders `<Faq faqs={HOME_FAQS} />`; `src/routes/faq.tsx`
was not touched.

Verified after both changes: `npm run build` succeeds, `npx tsc
--noEmit` shows no new errors in the changed files (same pre-existing
Supabase-typing errors in `src/lib/*.functions.ts` and `sound-fx.ts`
as before), and `npx eslint src/components/site/sections.tsx
src/routes/index.tsx` shows 0 errors — 3 warnings total, all the same
pre-existing `react-refresh/only-export-components` pattern (one new
instance from exporting `HOME_FAQS` alongside components, same as the
two constants already exported this way in `Pricing`).

## 2026-08-16 — Final CTA and homepage conversion cleanup

Established a clear 3-tier CTA hierarchy across the homepage in
`src/components/site/sections.tsx`:
- Primary — "Commencer à apprendre" → `/free-registration`
- Secondary — "Voir la démo" → `/lecons-demo` (Hero); "Voir une leçon
  démo" → `/lecon-demo-18` kept as a distinct secondary variant in
  `AppLaunch` since it jumps straight into one specific lesson, a
  genuinely different action from the demo hub
- Tertiary — "Voir les tarifs" → `/tarifs` (was "Voir le tarif" in
  `Paths`, now standardized)

Fixed an inverted visual hierarchy in `AppLaunch()`: the filled
(primary-styled) button was "Voir une leçon démo" and the outline
(secondary-styled) button was the actual signup link. Swapped styling
and reordered so the signup CTA is visually primary and labeled
"Commencer à apprendre", matching Hero.

`Pricing()`'s plan-specific buttons ("Commencer avec HiT START Daily",
"Réserver ma place en coaching") were left as-is — each names a
specific plan/format via a `search` param, which is the "specific
purpose" exception, not random label-switching.

`FinalCta()` rewritten to the required realistic copy: headline "Ton
anglais peut commencer à changer aujourd'hui.", supporting line "Pas
besoin d'attendre d'avoir plus de temps ou un niveau parfait. Commence
avec une petite étape, puis continue.", primary button standardized to
"Commencer à apprendre". Dropped the old "Chaque jour d'attente..."
copy and the stray English "Learn. Grow. Succeed." tagline — both
read as vague-outcome hype, inconsistent with the site's existing
"pas de promesse de résultat garanti" convention (see `Transformation()`).

Also touched, since they carry the exact same generic signup action
and would otherwise contradict the new hierarchy:
- `src/components/site/shared.tsx` — `FloatingCta()`'s sticky button
  said "Réserver ma place" (one of the explicitly-flagged rotating
  phrases) for the plain `/free-registration` signup with no
  plan-specific purpose; standardized to "Commencer à apprendre"
  (label + aria-label).
- `src/components/site/onboarding-tour.tsx` — the "final-cta" tour
  step quoted the old headline/tagline verbatim; updated so the
  guided tour doesn't describe copy that no longer exists on the page.

Verified every homepage CTA route target exists (`/free-registration`,
`/lecons-demo`, `/lecon-demo-18`, `/tarifs`) — none needed changing.
`Nav.tsx`'s persistent header "Inscription gratuite" button was
checked and left alone: it's a site-wide (not homepage-only) compact
utility button in a space-constrained header, not part of the in-page
narrative CTA flow. `PricingGlance()` (a `Découvrir les programmes` /
`Voir toutes les questions` pair) was checked too but is dead code —
not imported/rendered anywhere — so it's out of scope.

Verified after this change: `npm run build` succeeds, `npx tsc
--noEmit` shows no new errors in the changed files, and `npx eslint`
on all three changed files shows 0 errors (8 pre-existing
`react-refresh/only-export-components` warnings, none new).

## 2026-08-16 — Nav order aligned to the app-first funnel

Audited `Nav.tsx`, the homepage links, `/programmes`, `/tarifs`,
`/faq`, and the other public routes (`/lecons-demo`, `/pourquoi`,
`/test-niveau`) against the new HiTako positioning: Learn → How it
works → Programs/learning path → Pricing → Community, with Events
never the dominant destination.

Findings: there is no "Events"/"Community" top-level nav item at all
today — Community only appears as a supporting section on `/`
(already reframed, see the 2026-08-16 entry above), so nothing there
implies physical events are the paid core product. `/programmes`,
`/tarifs`, and `/faq` were already free of any events-as-core-product
language. The one real gap was link *order* in `Nav.tsx`: `LINKS` led
with `/pourquoi`, before the hands-on `/lecons-demo` trial, and before
`/programmes`/`/tarifs`.

Reordered `LINKS` in `Nav.tsx` to `/lecons-demo` (try a real lesson —
"Learn"), `/pourquoi` (contains the "La méthode HiTako" 3-step
section — "How it works"), `/programmes` ("Programs/learning path"),
`/tarifs` ("Pricing"), then the lower-priority utility links
`/test-niveau` and `/faq`, unchanged in position. No routes, labels,
or components were added or removed — same 6 links, same styling,
same mobile-drawer filtering logic (`AUTHED_MOBILE_LINKS` still drops
`/lecons-demo` and `/tarifs` for signed-in members, and produces the
same authed-member order as before since both dropped links sat
outside that group either way).

Verified after this change: `npm run build` succeeds, `npx tsc
--noEmit` shows no new errors (same five pre-existing Supabase-typing
errors in `newsletter.functions.ts`, `quiz-leads.functions.ts`, and
`sound-fx.ts`), and `npx eslint src/components/site/Nav.tsx` shows 0
errors, 0 warnings.

## 2026-08-16 — Homepage SEO metadata refresh

`src/routes/index.tsx` previously set no `title`/`description`
overrides of its own, so `/` inherited the root layout's defaults in
`__root.tsx` — the old tagline ("...pour transformer l'anglais en
opportunités professionnelles et digitales. LEARN • GROW • SUCCEED
✨"), already flagged and removed from on-page copy in the Final CTA
cleanup above but still lingering in `<head>`.

Added explicit `title`, `description`, `og:title`, `og:description`,
`twitter:title`, and `twitter:description` tags to `/`'s `head()`,
along the suggested direction: title "HiTako Academy — Apprendre
l'anglais à son rythme à Madagascar" (62 chars), description "HiTako
Academy est une plateforme d'apprentissage de l'anglais pensée pour
les apprenants malgaches. Leçons pratiques, exercices, progression et
communauté pour apprendre à ton rythme." — which mirrors the exact
four pillars named in `MembershipValue()` (Learn/Practice/Progress/
Community), so it accurately describes the actual product rather than
a generic pitch. `og:image`/`twitter:image` and `twitter:card` were
left untouched (still inherited from root, still a valid image URL),
so the social preview card keeps working end to end.

Verified the override actually renders (not just added alongside the
root's): booted `vite dev` and fetched `/`'s SSR HTML — exactly one
`<title>`, one `description` meta, and one each of `og:title`/
`og:description`/`twitter:title`/`twitter:description`, all carrying
the new copy; `og:image`/`twitter:image`/`twitter:card` unchanged.
Also fetched `/pourquoi` to confirm its own distinct title still
renders correctly (no cross-route leakage from the index route's head
config). `npm run build` succeeds, `npx tsc --noEmit` shows no new
errors (same pre-existing Supabase-typing errors as before, none in
`index.tsx`), `npx eslint src/routes/index.tsx` shows 0 errors, 0
warnings.

## 2026-08-17 — Mobile UX + marketing QA (in progress)

Audited the live homepage (not just the source) at 360/390/430/
tablet/desktop using Playwright + Chromium, since this class of bug
(overflow, clipping, illegible screenshots) is only reliable to catch
by actually rendering the page. Full per-section screenshots and an
automated horizontal-overflow check (`document.documentElement.
scrollWidth` vs. viewport width) ran clean at every breakpoint — no
horizontal scroll anywhere.

Confirmed NOT bugs (ruled out during the audit, no fix applied):
- Hero headline looked tight to the viewport edge in a zoomed crop;
  exact bounding-box measurement showed the standard 20px `px-5`
  padding is intact at 360/390/430px. Optical illusion from zooming.
- What looked like the fixed header double-rendering over
  `AppLaunch()` mid-scroll is the intended translucent
  (`backdrop-blur-xl`) sticky header compositing over content — normal
  behavior, and `SiteLayout.tsx` already reserves a `h-[72px]` spacer
  after `<Nav />` so document flow isn't actually hidden behind it.
- `FloatingCta()` (bottom-right, appears past 600px scroll) transiently
  sits over parts of whatever card is in view at a given scroll
  position, including briefly over the Community section's ticket
  card. This is standard floating-action-button behavior — it doesn't
  obscure the ticket disclaimer itself (checked directly, see below)
  and it actively helps keep the primary CTA visible while scrolling,
  which is one of the things this audit was checking for.
- The event/ticket clarification in `Community()` ("Certains
  événements nécessitent un ticket séparé.") renders clearly on its
  own light-blue callout at every breakpoint checked so far — not
  buried or clipped.
- WhyEnglish's 5 obstacle cards and MembershipValue's 4 pillars
  initially appeared to render only 1–3 items with large blank gaps
  below. Root cause was in the *test script*, not the site: the
  Reveal-on-scroll animation (`useReveal()` in `shared.tsx`, a
  one-shot `IntersectionObserver` + 0.7s CSS transition) hadn't
  finished for later cards when the screenshot was taken. Fixed the
  audit script's scroll pass to recompute `scrollHeight` every
  iteration (it can grow after first paint) and to settle 500ms after
  scrolling each section into view before capturing. Confirmed via
  direct opacity inspection that all cards reach `opacity: 1` with
  the corrected timing. No site code changed for this.

Fixed (genuine bug, confirmed via file inspection + docs, not just
visual):
- `AppLaunch()`'s demo banner reserved `aspect-[1480/1063]` with
  `width={1480} height={1063}`, but the actual asset — and its
  documented target size in `ASSETS_TODO.md` — is 1200×400 (3:1).
  With `object-cover`, that mismatch would silently crop ~54% of a
  real screenshot's width off the sides the moment the placeholder is
  swapped for the real image, plus it was reserving the wrong aspect
  ratio pre-load (layout shift). Corrected the wrapper to
  `aspect-[1200/400]` and the `<img>` to `width={1200} height={400}`
  to match. Verified in the rendered page: the banner now displays at
  the correct 3:1 proportions.

**Not yet audited** (picking this back up next session): the Pricing
card badges and the plan-comparison table at the bottom of
`Pricing()` (screenshots taken, not yet reviewed in detail), the FAQ
accordion (tap targets, expanded-state text wrapping), `FinalCta()`,
and a tablet/desktop pass over Pricing/FAQ/FinalCta specifically.
Also want a general tap-target-size check (buttons/accordion toggles)
across breakpoints before calling this done.

Verified after the one fix applied so far: `npm run build` succeeds,
`npx tsc --noEmit` shows no new errors (same pre-existing Supabase-
typing errors as always, none in `sections.tsx`), `npx eslint
src/components/site/sections.tsx` shows 0 errors (3 pre-existing
`react-refresh/only-export-components` warnings, unrelated to this
change, none new).
