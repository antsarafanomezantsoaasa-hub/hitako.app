# Known issues (Stage 0 baseline)

_Last updated: 2026-08-15, from a clean `bun install` / `bun run dev` /
`bun run build` / `bun run lint` pass on `feature/stage-0-baseline-and-tooling`._

## Fixed on this branch

1. **`bun install` failed outside Lovable's sandbox.** The imported
   `bun.lock` pinned every package (not just `@lovable.dev/*`) to
   Lovable's private Artifact Registry mirror, which 403s off their
   network. Regenerated against the public registry — see the
   `fix(deps)` commit for detail.
2. **`bun run build` / `bun run dev` crashed with `ENOENT`.**
   `src/assets/` was empty in the export but 13 files under it are
   imported by components. Added placeholder images so both commands
   run; every placeholder still needs the real file. Full list in
   `ASSETS_TODO.md`.
3. **Root render could crash with "useAuth must be used within
   AuthProvider"** (2026-08-15, Phase 0.5). Fixed by moving
   `AuthProvider` from inside `RootComponent` up into `RootShell`
   (`src/routes/__root.tsx`), so it wraps every slot the router can
   render as `children` — `RootComponent`, `RoutePendingSplash`, and
   `ErrorComponent` alike — instead of only the normal-render slot.
   Verified in this sandbox: reverting the fix reproduces the exact
   documented 500 (stack trace confirms `useAuth` throwing from
   `RoutePendingSplash`) on the first cold `vite dev` request; with
   the fix, the same cold request returns 200. `bun run build` /
   `bun run lint` unaffected (same 4 pre-existing lint errors, 0 new
   TypeScript errors). Not yet verified against a live Supabase
   instance or on a throttled connection in a real browser — see
   gap below.

## Still open (not fixed here — Stage 0 was scoped to install/build/lint
reproducibility, not application-logic changes)

### 1. `useAuth` crash fix not yet verified under realistic conditions
The fix above closes the specific reproduction above, but this
sandbox can't reach `supabase.co` (see gap #6 below) and has no real
browser to throttle. Before relying on this for production traffic,
confirm on a real device/connection that: (a) sign-in still works
end-to-end now that `AuthProvider` mounts one level higher, and (b) a
genuinely slow first byte (not just a cold dev compile) still shows
`RoutePendingSplash` cleanly instead of any other edge case.

### 2. `bun run lint` exits 1 (4 errors, 21 warnings)
- **Errors** (`@typescript-eslint/no-explicit-any`, 4 total):
  `src/components/site/member-space/MemberSpaceShell.tsx:11-12`,
  `src/components/site/member-space/MemberSpaceSidebar.tsx:20-21`.
- **Warnings**: 1× `react-hooks/exhaustive-deps`
  (`ListeningActivity.tsx:270`); 20× `react-refresh/only-export-components`
  spread across `MemberAvatar.tsx`, `MemberNewsDialog.tsx`,
  `MemberSpaceShell.tsx`, `shared.tsx` (×2 files), `sections.tsx`,
  `badge.tsx`, `button.tsx`, `form.tsx`, `navigation-menu.tsx`,
  `sidebar.tsx`, `toggle.tsx`, `use-auth.tsx`, `use-cookie-consent.tsx`.

Not fixed here — pre-existing, not a Stage 0 blocker, but `lint`
should be made to pass (or these rules explicitly relaxed on purpose)
before it's wired into any CI gate.

### 3. Dev server needs an explicit IPv4 host in this sandbox
`bun run dev` (`vite dev`, default host) throws `EAFNOSUPPORT`
binding `::` — this container's network stack has no IPv6. Worked
around locally with `vite dev --host 127.0.0.1`. Likely
sandbox/CI-specific rather than a real bug, but anyone hitting the
same wall in a container without IPv6 will need the same flag; the
`dev` script in `package.json` doesn't set one.

### 4. Noisy route-tree warnings on every `dev`/`build` run
Several `src/routes/*.content.ts` files are picked up by TanStack's
file-based router and warned as "does not export a Route" (they're
content files, not routes): `conditions-generales.content.ts`,
`jeux.content.ts`, `lecon-01.content.ts`, `lecon-02.content.ts`,
`lecon-demo-18.content.ts`, `expression-du-jour_.jour-1.content.ts`,
`jeux_.flashcards.content.ts`. Harmless — TanStack excludes them from
the route tree automatically — but fixable per its own suggestion:
prefix each with `-` or set `routeFileIgnorePattern` in the TanStack
Start config.

### 5. `createServerFn().inputValidator()` deprecation warnings
11 call sites across `admin.functions.ts`, `settings.functions.ts`,
`lesson-ratings.functions.ts`, `registration.functions.ts`,
`lessons.functions.ts`, `quiz-leads.functions.ts`,
`newsletter.functions.ts` use the now-deprecated `.inputValidator()`;
TanStack Start wants `.validator()`. Not breaking yet, but likely to
break on a future major bump.

### 6. Supabase-dependent behavior untested in this environment
This sandbox's network egress doesn't resolve `supabase.co`, so auth,
DB reads/writes, and anything else that talks to the project's
Supabase instance couldn't be exercised here — the checks above cover
install/build/lint/dev-boot only, not data-layer correctness.
