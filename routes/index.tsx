import { createFileRoute } from "@tanstack/react-router";
import {
  Hero,
  AppLaunch,
  WhyEnglish,
  Transformation,
  Paths,
  Community,
  WhyHitako,
  Stories,
  MembershipValue,
  Pricing,
  Faq,
  HOME_FAQS,
  FinalCta,
} from "@/components/site/sections";
import heroAsset from "@/assets/hero.jpg";
import demoLaunchAsset from "@/assets/demo-launch-banner.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HiTako Academy — Apprendre l'anglais à son rythme à Madagascar" },
      {
        name: "description",
        content:
          "HiTako Academy est une plateforme d'apprentissage de l'anglais pensée pour les apprenants malgaches. Leçons pratiques, exercices, progression et communauté pour apprendre à ton rythme.",
      },
      {
        property: "og:title",
        content: "HiTako Academy — Apprendre l'anglais à son rythme à Madagascar",
      },
      {
        property: "og:description",
        content:
          "HiTako Academy est une plateforme d'apprentissage de l'anglais pensée pour les apprenants malgaches. Leçons pratiques, exercices, progression et communauté pour apprendre à ton rythme.",
      },
      {
        name: "twitter:title",
        content: "HiTako Academy — Apprendre l'anglais à son rythme à Madagascar",
      },
      {
        name: "twitter:description",
        content:
          "HiTako Academy est une plateforme d'apprentissage de l'anglais pensée pour les apprenants malgaches. Leçons pratiques, exercices, progression et communauté pour apprendre à ton rythme.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/3ApYR2OWn8R04jEHg0kqfh5cs4K3/social-images/social-1784107798411-Screenshot_2026-02-09_083355.webp",
      },
    ],
    // Preload the two images visible without scrolling (hero photo + the
    // "Portail étudiant" banner) so the browser starts fetching them
    // immediately, in parallel with app JS, instead of waiting for React
    // to render the <img> tags before the request even starts.
    links: [
      { rel: "preload", as: "image", href: heroAsset, fetchPriority: "high" },
      { rel: "preload", as: "image", href: demoLaunchAsset },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <>
      {/* 1. Hero — what HiTako is */}
      <Hero />
      {/* 2. App / product demonstration — the student portal is the
          primary product; this also carries the only "method in action"
          copy that exists today (see homepage-hierarchy report). */}
      <AppLaunch />
      {/* 3. What learners get — concrete, tangible benefits of learning
          English with HiTako. */}
      <WhyEnglish />
      {/* 4. Transformation / practical outcomes — the emotional payoff,
          positioned after benefits are established. */}
      <Transformation />
      {/* 5. Learning path — HiT START → FLOW → PRO progression. */}
      <Paths />
      {/* 6. Community — supports the learning product; no signup CTA of
          its own, so it never competes with the app as the main offer. */}
      <Community />
      {/* 7. Why HiTako — differentiation / trust, right before proof. */}
      <WhyHitako />
      {/* 8. Testimonials */}
      <Stories />
      {/* 9. Membership value — everything a HiTako access includes, grouped
          by learn / practice / progress / community, right before the
          price so the system is clear before the cost is. */}
      <MembershipValue />
      {/* 10. Pricing — moved below all value-building sections instead of
          appearing right after the hero. */}
      <Pricing />
      {/* 11. FAQ — full accordion (replaces the old embedded FAQ teaser
          that duplicated /faq content). Homepage-specific question set:
          broader product/community/events questions than the HiT
          START-focused /faq page. */}
      <Faq faqs={HOME_FAQS} />
      {/* 12. Final CTA */}
      <FinalCta />
    </>
  );
}
