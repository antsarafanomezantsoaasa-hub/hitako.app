# Image asset status

_Last run: 2026-08-15 · mode: Stage 0 baseline fix_

`src/assets/` was empty in the uploaded export, but 13 files under it are
imported directly by components/routes (`import x from "@/assets/...`).
Vite resolves those imports at build/dev time, so a missing file isn't a
broken `<img>` — it's a hard `bun run build` / `bun run dev` failure
(`ENOENT`, then `Cannot find module`) on every route that (transitively)
renders `SiteLayout`, `Nav`, or the homepage sections. That was blocking
Stage 0's "does it install and run" check entirely, so this fix drops in
placeholder images at the right filenames/dimensions to unblock the build.

**These are flat-color placeholders with a label baked in — not real
brand assets.** Every one below needs to be swapped for the real file
before this ships anywhere a user will see it.

- Required: **13**
- Present (real): **0**
- Present (placeholder): **13**

| File | Used in | Placeholder size | Real content needed |
|---|---|---|---|
| `hitako-logo-mark.png` | `Splash.tsx` | 256×256 | Logo mark (icon only) |
| `hitako-logo-new.png` | `SiteLayout.tsx`, `Nav.tsx`, `MemberSpaceShell.tsx` | 512×160 | Full wordmark logo |
| `hero.jpg` | `sections.tsx`, `routes/index.tsx` | 1600×1000 | Homepage hero photo |
| `demo-launch-banner.png` | `sections.tsx`, `routes/index.tsx` | 1024×1536 (transparent bg, phone mockup) | Launch/demo promo phone mockup |
| `antsa-founder.jpg` | `sections.tsx` | 800×1000 | Founder headshot |
| `community.jpg` | `sections.tsx` | 1200×900 | Community/club photo |
| `doodles-tile.png` | `MemberAppShell.tsx` | 400×400 | Repeating background pattern |
| `hero-avatar-1.png` | `sections.tsx` | 160×160 | Member/testimonial avatar |
| `hero-avatar-2.png` | `sections.tsx` | 160×160 | Member/testimonial avatar |
| `hero-avatar-3.png` | `sections.tsx` | 160×160 | Member/testimonial avatar |
| `hit-start-daily-english-ad.jpg` | `confirm-registration.tsx` | 1200×630 | HiT START program ad creative |
| `zero-program-hero.jpg` | `program-roadmap.tsx` | 1600×900 | "Zero" program hero image |
| `zero-welcome-banner.jpg` | `confirm-registration.tsx` | 1600×500 | "Zero" program welcome banner |

Regenerate the placeholders (e.g. after adding a new image import that's
still missing a real file) with Pillow — a solid-color `Image.new(...)`
plus `ImageDraw.multiline_text(...)` at the dimensions above is enough;
no need for anything fancier just to unblock the build.
