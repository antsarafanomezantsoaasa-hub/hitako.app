/**
 * Sound-effects engine for lesson interactions, games, and site-wide
 * feedback (correct/wrong answers, finishing a lesson or game, turning a
 * page/card, celebrating a milestone, notifications, small UI taps).
 *
 * Every effect has two layers, tried in order:
 *
 *   1. A real, produced audio clip at `public/audio/sfx/<name>.mp3`,
 *      fetched and decoded into an in-memory `AudioBuffer` ahead of time
 *      (see `preloadSfx`) and played through the Web Audio API. This is
 *      the "beautiful" version — a proper sound designer's file instead
 *      of a beep — and it fires the instant it's requested, because
 *      there's no per-play network/decode work left to do. See "Latency"
 *      below.
 *   2. A tiny sound synthesized on the fly with the Web Audio API, used
 *      whenever the matching file hasn't been dropped in yet, fails to
 *      load, or (rarely) hasn't finished preloading yet for this one call.
 *
 * That split means the app already sounds good with zero assets shipped,
 * and it upgrades itself the moment a real file lands at the right path —
 * nothing else to wire up, no code changes needed. See
 * `public/audio/sfx/README.md` for the exact file list, naming, and format
 * guidance to hand to a sound designer (or generate yourself).
 *
 * Latency: a plain `new Audio(url).play()` call — the naive way to play a
 * one-shot clip — re-fetches and re-decodes the file *every single time*
 * it's called, which is audibly late (tens to hundreds of ms) and lands at
 * a different delay on every tap, so it never feels in sync with the
 * button press. To avoid that, every real file is fetched + decoded into
 * an `AudioBuffer` exactly once (`preloadSfx`, called once near app start
 * — see `src/routes/__root.tsx`), and playback schedules that buffer on a
 * fresh `AudioBufferSourceNode` starting at `ctx.currentTime`. Creating a
 * source node from an already-decoded buffer is essentially free, so the
 * sound starts in the same tick as the click that triggered it.
 *
 * Usage:
 *   import { playCorrect, playWrong, playLessonComplete } from "@/lib/sound-fx";
 *   playCorrect();
 */

const SOUND_PREF_KEY = "hitako:sound-fx-enabled";
const SFX_DIR = "/audio/sfx";

/** Every sound effect the app can play. Keep this in sync with `public/audio/sfx/README.md`. */
export type SfxName =
  | "correct"
  | "wrong"
  | "lesson-complete"
  | "game-complete"
  | "page-turn"
  | "congratulations"
  | "new-message"
  | "update"
  | "click";

/** Canonical list, also consumed by `scripts/audit-sfx-audio.ts`. */
export const SFX_NAMES: SfxName[] = [
  "correct",
  "wrong",
  "lesson-complete",
  "game-complete",
  "page-turn",
  "congratulations",
  "new-message",
  "update",
  "click",
];

const SFX_FILE: Record<SfxName, string> = {
  correct: `${SFX_DIR}/correct.mp3`,
  wrong: `${SFX_DIR}/wrong.mp3`,
  "lesson-complete": `${SFX_DIR}/lesson-complete.mp3`,
  "game-complete": `${SFX_DIR}/game-complete.mp3`,
  "page-turn": `${SFX_DIR}/page-turn.mp3`,
  congratulations: `${SFX_DIR}/congratulations.mp3`,
  "new-message": `${SFX_DIR}/new-message.mp3`,
  update: `${SFX_DIR}/update.mp3`,
  click: `${SFX_DIR}/click.mp3`,
};

/** Per-sound playback volume (0–1), applied to both the file and the synth fallback. */
const SFX_VOLUME: Record<SfxName, number> = {
  correct: 0.9,
  wrong: 0.8,
  "lesson-complete": 0.9,
  "game-complete": 0.9,
  "page-turn": 0.55,
  congratulations: 0.95,
  "new-message": 0.7,
  update: 0.6,
  click: 0.45,
};

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem(SOUND_PREF_KEY);
    return stored === null ? true : stored === "1";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_PREF_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage errors (private browsing, quota, etc.) — sound just
    // won't persist across sessions, which is a harmless degradation.
  }
}

/* ================================================================
   Layer 0 — whole-page background ambience (looping bed)
   ================================================================ */

const AMBIENT_TRACK = `${SFX_DIR}/mixkit-owies-ukulele-1072.mp3`;
const AMBIENT_PREF_KEY = "hitako:ambient-enabled";

/**
 * Kept well below every one-shot SFX volume above (0.45–0.95) on purpose —
 * this plays continuously underneath everything else, so it needs to sit
 * back in the mix rather than competing with taps, correct/wrong dings,
 * lesson-complete fanfares, etc.
 */
export const AMBIENT_VOLUME = 0.12;

/**
 * Whether the background ambience loop is on. This is its own preference,
 * separate from `isSoundEnabled`/`SOUND_PREF_KEY` (the one-shot SFX
 * on/off switch) — muting the ambient bed via the header's settings menu
 * shouldn't silence taps, correct/wrong dings, etc., and vice versa. It's
 * still subordinate to the master SFX toggle, though: if that's off, the
 * ambience stays off too regardless of this preference (see
 * `createAmbientController`'s `play()` below).
 */
export function isAmbientEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem(AMBIENT_PREF_KEY);
    return stored === null ? true : stored === "1";
  } catch {
    return true;
  }
}

export function setAmbientEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AMBIENT_PREF_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage errors — the mute just won't persist across sessions.
  }
}

export interface AmbientController {
  /** Attempts playback; resolves true if it actually started. */
  play: () => Promise<boolean>;
  /** Fades the loop out smoothly, then pauses it (see `AMBIENT_FADE_OUT_MS`). */
  pause: () => void;
  /** Stops playback immediately and releases the underlying <audio> element for good. */
  destroy: () => void;
}

/** How long `pause()`'s fade-out takes to go from full volume to silence. */
const AMBIENT_FADE_OUT_MS = 600;
/** Steps in the fade-out ramp — enough to sound smooth, not so many it's wasteful. */
const AMBIENT_FADE_STEPS = 24;

/**
 * Creates one looping <audio> element for the whole-page background
 * ambience (ukulele bed) used by the member area (/mon-espace, /zero).
 * Callers own the lifecycle — typically one controller per mount of the
 * member app shell:
 *
 *   - `play()` to (re)start the loop — respects the same mute preference as
 *     the rest of the SFX engine, so a muted member never hears it. Also
 *     cancels any fade-out in progress and restores full volume, so
 *     resuming right after a pause doesn't start out quiet.
 *   - `pause()` when the tab/page goes inactive or the member mutes it —
 *     fades the volume down smoothly over `AMBIENT_FADE_OUT_MS` rather than
 *     cutting it off mid-note, then actually pauses the element.
 *   - `destroy()` on unmount (e.g. the member launches a lesson and
 *     navigates out of the member shell entirely) to stop it for good,
 *     immediately — teardown needs to be deterministic, so this one is a
 *     hard stop rather than a fade.
 */
export function createAmbientController(): AmbientController {
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    return { play: () => Promise.resolve(false), pause: () => {}, destroy: () => {} };
  }

  const audio = new Audio(AMBIENT_TRACK);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = AMBIENT_VOLUME;

  let fadeTimer: number | null = null;

  function cancelFade() {
    if (fadeTimer !== null) {
      window.clearInterval(fadeTimer);
      fadeTimer = null;
    }
  }

  function fadeOutThenPause() {
    cancelFade();
    if (audio.paused) return;

    const startVolume = audio.volume;
    if (startVolume <= 0) {
      audio.pause();
      audio.volume = AMBIENT_VOLUME;
      return;
    }

    let step = 0;
    const stepMs = AMBIENT_FADE_OUT_MS / AMBIENT_FADE_STEPS;
    fadeTimer = window.setInterval(() => {
      step += 1;
      const progress = step / AMBIENT_FADE_STEPS;
      audio.volume = Math.max(0, startVolume * (1 - progress));
      if (step >= AMBIENT_FADE_STEPS) {
        cancelFade();
        audio.pause();
        // Reset so the *next* play() starts at full volume again instead
        // of resuming from the faded-out level.
        audio.volume = AMBIENT_VOLUME;
      }
    }, stepMs);
  }

  return {
    play: () => {
      if (!isSoundEnabled() || !isAmbientEnabled()) return Promise.resolve(false);
      cancelFade();
      audio.volume = AMBIENT_VOLUME;
      return audio
        .play()
        .then(() => true)
        .catch(() => false);
    },
    pause: () => {
      fadeOutThenPause();
    },
    destroy: () => {
      cancelFade();
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    },
  };
}

/* ================================================================
   Layer 2 (context) — shared AudioContext, needed by both the real-file
   layer below (to decode + play buffers) and the synthesized fallback
   further down.
   ================================================================ */

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!sharedCtx) {
    try {
      sharedCtx = new AudioCtor();
    } catch {
      return null;
    }
  }
  if (sharedCtx.state === "suspended") {
    // Autoplay policies suspend new contexts until a user gesture — quiz
    // taps/clicks count, so this resolves silently on the first interaction.
    void sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

/* ================================================================
   Layer 1 — real audio files, preloaded + decoded ahead of time
   ================================================================

   Playing a one-shot SFX with a fresh `new Audio(url); audio.play()` on
   every tap — the naive approach — re-fetches and re-decodes the clip
   every single time, which is where the audible latency between "button
   hit" and "sound heard" was coming from. Instead, every file is fetched
   and decoded into an `AudioBuffer` exactly once and cached; playback then
   just spins up a fresh `AudioBufferSourceNode` from the already-decoded
   buffer and starts it at `ctx.currentTime`, which is effectively
   instantaneous (no network, no decode) and keeps every tap in sync. */

type FileStatus = "loading" | "available" | "unavailable";
// Once a file 404s (or fails to decode) in this session we stop retrying it
// over the network — just fall straight through to the synth version for
// the rest of the session. A full page reload re-checks from scratch, so
// dropping a real file in and refreshing picks it up immediately.
const fileStatus = new Map<SfxName, FileStatus>();
const fileBuffers = new Map<SfxName, AudioBuffer>();
const filePromises = new Map<SfxName, Promise<AudioBuffer | null>>();

function loadFileBuffer(name: SfxName): Promise<AudioBuffer | null> {
  const existing = filePromises.get(name);
  if (existing) return existing;

  if (typeof window === "undefined" || typeof fetch === "undefined") return Promise.resolve(null);
  const ctx = getContext();
  if (!ctx) return Promise.resolve(null);

  fileStatus.set(name, "loading");
  const promise = fetch(SFX_FILE[name])
    .then((res) => {
      if (!res.ok) throw new Error(`sfx fetch failed: ${res.status}`);
      return res.arrayBuffer();
    })
    // decodeAudioData works fine while the context is still suspended
    // (pre-user-gesture) — only actually *starting* playback needs a
    // resumed context, which `getContext()` handles at play time.
    .then((data) => ctx.decodeAudioData(data))
    .then((buffer) => {
      fileBuffers.set(name, buffer);
      fileStatus.set(name, "available");
      return buffer;
    })
    .catch(() => {
      fileStatus.set(name, "unavailable");
      return null;
    });

  filePromises.set(name, promise);
  return promise;
}

/**
 * Kicks off fetching + decoding every real SFX file up front, so buffers
 * are already sitting in memory by the time the member taps anything.
 * Safe to call more than once — each file is only ever fetched/decoded a
 * single time (subsequent calls just return the cached promise). Call this
 * once, as early as possible, well before the first interaction — fetching
 * and decoding don't require a user gesture, only *starting* playback
 * does. See `src/routes/__root.tsx`.
 */
export function preloadSfx(): void {
  if (typeof window === "undefined") return;
  for (const name of SFX_NAMES) void loadFileBuffer(name);
}

/** Plays an already-decoded buffer immediately. Returns false if it isn't ready yet. */
function tryPlayBuffer(name: SfxName): boolean {
  const ctx = getContext();
  if (!ctx) return false;
  const buffer = fileBuffers.get(name);
  if (!buffer) return false;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = SFX_VOLUME[name];
  source.connect(gain);
  gain.connect(ctx.destination);
  // No `when` argument (equivalently `start(0)`) — schedules playback for
  // right now, sample-accurately, with no extra latency of its own.
  source.start();
  return true;
}

/* ================================================================
   Layer 2 — synthesized fallback (Web Audio API)
   ================================================================ */

type ToneOptions = {
  frequency: number;
  startAt: number;
  duration: number;
  type?: OscillatorType;
  peakGain?: number;
  glideTo?: number;
};

function scheduleTone(ctx: AudioContext, master: GainNode, opts: ToneOptions) {
  const { frequency, startAt, duration, type = "sine", peakGain = 0.18, glideTo } = opts;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);
  if (glideTo) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), startAt + duration);
  }
  // Quick attack, smooth exponential decay — avoids clicks and sounds far
  // more pleasant than a hard on/off gain switch.
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peakGain, startAt + Math.min(0.02, duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

type NoiseOptions = {
  startAt: number;
  duration: number;
  peakGain?: number;
  filterFrom?: number;
  filterTo?: number;
};

/** A short filtered noise burst — used for the page-turn "riffle" sound. */
function scheduleNoise(ctx: AudioContext, master: GainNode, opts: NoiseOptions) {
  const { startAt, duration, peakGain = 0.15, filterFrom = 3200, filterTo = 1200 } = opts;
  const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(filterFrom, startAt);
  filter.frequency.exponentialRampToValueAtTime(Math.max(200, filterTo), startAt + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peakGain, startAt + Math.min(0.015, duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  noise.start(startAt);
  noise.stop(startAt + duration + 0.02);
}

function withMaster(
  volume: number,
  build: (ctx: AudioContext, master: GainNode, now: number) => void,
) {
  const ctx = getContext();
  if (!ctx) return;
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  build(ctx, master, ctx.currentTime);
}

function playTones(tones: ToneOptions[], volume: number) {
  withMaster(volume, (ctx, master, now) => {
    for (const tone of tones) scheduleTone(ctx, master, { ...tone, startAt: now + tone.startAt });
  });
}

const SYNTH: Record<SfxName, () => void> = {
  /** Bright two-note "ding-ding" for a correct quiz answer. */
  correct: () =>
    playTones(
      [
        { frequency: 987.77, startAt: 0, duration: 0.11, type: "sine", peakGain: 0.2 }, // B5
        { frequency: 1318.51, startAt: 0.09, duration: 0.16, type: "sine", peakGain: 0.22 }, // E6
      ],
      SFX_VOLUME.correct,
    ),

  /** Soft, low, non-punishing "buzz" for a wrong quiz answer. */
  wrong: () =>
    playTones(
      [
        {
          frequency: 196,
          startAt: 0,
          duration: 0.22,
          type: "triangle",
          peakGain: 0.16,
          glideTo: 130,
        },
      ],
      SFX_VOLUME.wrong,
    ),

  /** Small triumphant ascending arpeggio when a full lesson is completed. */
  "lesson-complete": () =>
    playTones(
      [
        { frequency: 523.25, startAt: 0, duration: 0.14, type: "sine", peakGain: 0.18 }, // C5
        { frequency: 659.25, startAt: 0.11, duration: 0.14, type: "sine", peakGain: 0.18 }, // E5
        { frequency: 783.99, startAt: 0.22, duration: 0.14, type: "sine", peakGain: 0.2 }, // G5
        { frequency: 1046.5, startAt: 0.33, duration: 0.32, type: "sine", peakGain: 0.24 }, // C6
      ],
      SFX_VOLUME["lesson-complete"],
    ),

  /** Bouncier, chiptune-flavoured run for finishing a game (distinct from a lesson). */
  "game-complete": () =>
    playTones(
      [
        { frequency: 587.33, startAt: 0, duration: 0.09, type: "square", peakGain: 0.12 }, // D5
        { frequency: 739.99, startAt: 0.08, duration: 0.09, type: "square", peakGain: 0.13 }, // F#5
        { frequency: 880, startAt: 0.16, duration: 0.09, type: "square", peakGain: 0.14 }, // A5
        { frequency: 1174.66, startAt: 0.24, duration: 0.11, type: "square", peakGain: 0.15 }, // D6
        { frequency: 1479.98, startAt: 0.35, duration: 0.3, type: "square", peakGain: 0.17 }, // F#6
      ],
      SFX_VOLUME["game-complete"],
    ),

  /** Quick filtered-noise "riffle" for turning a lesson page or flipping a card. */
  "page-turn": () =>
    withMaster(SFX_VOLUME["page-turn"], (ctx, master, now) => {
      scheduleNoise(ctx, master, {
        startAt: now,
        duration: 0.14,
        peakGain: 0.18,
        filterFrom: 3600,
        filterTo: 1400,
      });
      scheduleNoise(ctx, master, {
        startAt: now + 0.05,
        duration: 0.1,
        peakGain: 0.1,
        filterFrom: 2400,
        filterTo: 900,
      });
    }),

  /** Bigger fanfare + held bright chord for milestones, streaks, and badges. */
  congratulations: () =>
    playTones(
      [
        { frequency: 523.25, startAt: 0, duration: 0.12, type: "sine", peakGain: 0.16 }, // C5
        { frequency: 659.25, startAt: 0.09, duration: 0.12, type: "sine", peakGain: 0.17 }, // E5
        { frequency: 783.99, startAt: 0.18, duration: 0.12, type: "sine", peakGain: 0.18 }, // G5
        { frequency: 1046.5, startAt: 0.27, duration: 0.12, type: "sine", peakGain: 0.2 }, // C6
        // Held triad — the "ta-da" landing chord.
        { frequency: 1046.5, startAt: 0.38, duration: 0.45, type: "sine", peakGain: 0.22 }, // C6
        { frequency: 1318.51, startAt: 0.38, duration: 0.45, type: "sine", peakGain: 0.19 }, // E6
        { frequency: 1567.98, startAt: 0.38, duration: 0.45, type: "sine", peakGain: 0.17 }, // G6
      ],
      SFX_VOLUME.congratulations,
    ),

  /** Gentle two-note notification "pop" for a new message. */
  "new-message": () =>
    playTones(
      [
        { frequency: 830.61, startAt: 0, duration: 0.09, type: "sine", peakGain: 0.15 }, // G#5
        { frequency: 1108.73, startAt: 0.07, duration: 0.14, type: "sine", peakGain: 0.16 }, // C#6
      ],
      SFX_VOLUME["new-message"],
    ),

  /** Single soft rising blip for background updates (new content, announcements). */
  update: () =>
    playTones(
      [
        {
          frequency: 698.46,
          startAt: 0,
          duration: 0.13,
          type: "sine",
          peakGain: 0.13,
          glideTo: 880,
        },
      ],
      SFX_VOLUME.update,
    ),

  /** Very short, quiet tick for light UI taps. */
  click: () =>
    playTones(
      [{ frequency: 1600, startAt: 0, duration: 0.035, type: "sine", peakGain: 0.09 }],
      SFX_VOLUME.click,
    ),
};

/* ================================================================
   Public dispatch
   ================================================================ */

function play(name: SfxName) {
  if (!isSoundEnabled()) return;

  // Common case: the file was already preloaded (see `preloadSfx`), so
  // this plays it synchronously, right now — no fetch/decode latency
  // between the tap and the sound.
  if (tryPlayBuffer(name)) return;

  if (fileStatus.get(name) === "unavailable") {
    SYNTH[name]();
    return;
  }

  // Rare case: this tap happened before preloading finished (or before it
  // was ever kicked off) — play the synth version now so there's no
  // audible delay for *this* tap, and make sure loading is under way so
  // every subsequent tap gets the real file.
  SYNTH[name]();
  void loadFileBuffer(name);
}

/** Correct quiz/game answer. */
export function playCorrect() {
  play("correct");
}

/** Wrong quiz/game answer. */
export function playWrong() {
  play("wrong");
}

/** A full lesson has been completed. */
export function playLessonComplete() {
  play("lesson-complete");
}

/** A game (flashcards, quiz, etc.) has been completed. */
export function playGameComplete() {
  play("game-complete");
}

/** Turning a lesson page, or flipping a card. */
export function playPageTurn() {
  play("page-turn");
}

/** A bigger celebration — milestones, streaks, badges earned. */
export function playCongratulations() {
  play("congratulations");
}

/** A new message/notification has arrived. */
export function playNewMessage() {
  play("new-message");
}

/** Generic "something updated" ping (new content, announcements, background sync). */
export function playUpdate() {
  play("update");
}

/** Very light UI tap — use sparingly. */
export function playClick() {
  play("click");
}
