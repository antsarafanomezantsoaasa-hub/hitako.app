import { useEffect } from "react";

/**
 * Keeps `--app-vh` in sync with the *real* visible viewport height and, when
 * `lock` is true, prevents the document itself from scrolling.
 *
 * Why not rely on `100dvh` alone: on iOS Safari and some Android WebViews the
 * dvh value updates a frame (or a whole URL-bar animation) late, which leaves
 * a blank band at the bottom of a fixed app shell.
 *
 * Why not rely on `visualViewport.height` alone either: right after a login
 * or registration redirect (landing straight on /zero or /mon-espace, e.g.
 * from a confirmation link, or resuming a backgrounded tab), the very first
 * `visualViewport` reading can be a transient, too-small number captured
 * before the browser has finished settling its address bar / toolbar — and
 * with the document scroll locked in the member area, nothing ever nudges it
 * again. That stale, undershooting value then permanently caps the app shell
 * shorter than the actual screen, leaving a dead gap under the tab bar that
 * only a manual reload/resize would clear.
 *
 * The fix: track a hidden `100dvh` probe element with a ResizeObserver — that
 * always mirrors the browser's own live, settled dvh value with no polling or
 * timing games — and combine it with `visualViewport.height`, taking
 * whichever is larger *unless* `visualViewport` is meaningfully smaller (the
 * on-screen keyboard genuinely eating space), in which case we shrink to it
 * on purpose so content stays reachable above the keyboard. Re-measuring on
 * `pageshow`/`focus`/`visibilitychange` (in addition to resize/orientation)
 * also catches the tab being resumed from background or a fresh landing.
 *
 * Purely presentational: it touches no app state, data or routing.
 */
export function useAppViewport(lock: boolean) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    // Invisible probe kept in sync with the browser's own native `100dvh` —
    // this is the source of truth for "how tall is the settled viewport
    // right now", live-updated by ResizeObserver instead of a one-off read.
    const probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:fixed;inset:0;height:100dvh;width:0;margin:0;padding:0;" +
      "border:0;pointer-events:none;visibility:hidden;z-index:-1;";
    document.body.appendChild(probe);

    let dvhPx = probe.getBoundingClientRect().height || window.innerHeight;
    // Above roughly this many px smaller than the settled dvh, treat the gap
    // as the on-screen keyboard (which is always well over 100px) rather
    // than a transient address-bar animation frame (usually under ~100px).
    const KEYBOARD_THRESHOLD_PX = 150;

    const apply = () => {
      const vv = window.visualViewport;
      const liveVv = Math.round(vv?.height ?? window.innerHeight);
      const settledDvh = Math.round(dvhPx);
      const h =
        settledDvh - liveVv > KEYBOARD_THRESHOLD_PX
          ? liveVv // keyboard is open — shrink on purpose so content stays reachable
          : Math.max(settledDvh, liveVv); // otherwise never trust the smaller of two live reads
      if (h > 0) root.style.setProperty("--app-vh", `${h}px`);
    };

    const ro = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.height;
      if (next) dvhPx = next;
      apply();
    });
    ro.observe(probe);

    apply();

    const vv = window.visualViewport;
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    window.addEventListener("pageshow", apply);
    window.addEventListener("focus", apply);
    document.addEventListener("visibilitychange", apply);
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);

    return () => {
      ro.disconnect();
      probe.remove();
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      window.removeEventListener("pageshow", apply);
      window.removeEventListener("focus", apply);
      document.removeEventListener("visibilitychange", apply);
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const cls = "member-viewport-lock";
    const { documentElement: html, body } = document;

    if (lock) {
      html.classList.add(cls);
      body.classList.add(cls);
      // Any residual document scroll would show the page background under the
      // fixed shell; reset it once when entering the member area.
      window.scrollTo(0, 0);
    } else {
      html.classList.remove(cls);
      body.classList.remove(cls);
    }

    return () => {
      html.classList.remove(cls);
      body.classList.remove(cls);
    };
  }, [lock]);
}
