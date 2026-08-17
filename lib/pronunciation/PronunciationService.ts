/**
 * PronunciationService
 * =====================
 * Single entry point the UI talks to for "play this pronunciation".
 *
 *   1. Resolve which voice a speaker (e.g. "young_man") should use.
 *   2. Check the IndexedDB cache (audioCache.ts) — a hit plays instantly,
 *      no network, works offline.
 *   3. On a miss, ask the active TTSProvider to synthesize the clip,
 *      playing it immediately and caching the result for next time.
 *   4. If the primary provider is unavailable (not configured, offline,
 *      request failed), transparently fall back to the browser's built-in
 *      voice so playback never just fails silently.
 *
 * Nothing in this file, or anywhere else under src/lib/pronunciation/,
 * touches Supabase. Audio lives only in the browser (IndexedDB) or, for the
 * one-off Web Speech fallback, is never persisted at all — so Supabase
 * Storage usage for pronunciation audio is always exactly zero.
 *
 * Swapping providers later: pass a different TTSProvider into
 * `pronunciationService.setProvider(...)`, or edit
 * providers/staticAudioProvider.ts / audio-manifest.json directly.
 * UI components never change.
 */
import type {
  PlaybackSpeed,
  PronunciationState,
  SpeakOptions,
  SynthesizeResult,
  TTSProvider,
  VoiceProfile,
} from "./types";
import { SLOW_PLAYBACK_RATE, TTSProviderUnavailableError } from "./types";
import { audioCacheStore, buildCacheKey } from "./audioCache";
import { resolveVoice } from "./voices";
import { staticAudioProvider } from "./providers/staticAudioProvider";
import { webSpeechProvider } from "./providers/webSpeechProvider";
import { setPreservesPitch } from "../audio-playback-rate";

const DEFAULT_LANG = "en-US";
const DEFAULT_RATE = 0.92;

class PronunciationService {
  private primaryProvider: TTSProvider;
  private fallbackProvider: TTSProvider;
  private currentAudio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;

  constructor(primaryProvider: TTSProvider, fallbackProvider: TTSProvider) {
    this.primaryProvider = primaryProvider;
    this.fallbackProvider = fallbackProvider;
  }

  /** Swap the primary TTS backend at runtime (e.g. after loading user/account settings). */
  setProvider(provider: TTSProvider): void {
    this.primaryProvider = provider;
  }

  /** Cache-check helper so UI can decide up front whether a click will need a spinner. */
  async isCached(text: string, options: SpeakOptions = {}): Promise<boolean> {
    const voice = resolveVoice(
      options.speaker,
      options.lang ?? DEFAULT_LANG,
      options.rate ?? DEFAULT_RATE,
    );
    const key = buildCacheKey(text, voice.remoteVoiceId, voice.lang, voice.rate);
    return audioCacheStore.has(key);
  }

  /**
   * Resolve a reusable reference clip for a phrase, as a `Blob` rather than
   * something that just plays once.
   *
   * `speak()` is happy to let Web Speech play itself with no bytes at all —
   * fine for a one-off 🔊 tap, but Shadowing Mode (see `lib/shadowing/`)
   * needs a real `<audio src>` to build its countdown/record-sync
   * choreography around. So this only ever resolves through providers that
   * hand back bytes (the IndexedDB cache, then the primary provider) and
   * deliberately never falls back to Web Speech. If it rejects, the caller
   * should treat that phrase as "no reference clip available yet" rather
   * than trying to shadow silence.
   */
  async getReferenceBlob(text: string, options: SpeakOptions = {}): Promise<Blob> {
    const voice = resolveVoice(
      options.speaker,
      options.lang ?? DEFAULT_LANG,
      options.rate ?? DEFAULT_RATE,
    );
    const key = buildCacheKey(text, voice.remoteVoiceId, voice.lang, voice.rate);

    const cached = await audioCacheStore.get(key);
    if (cached) return cached;

    const result = await this.primaryProvider.synthesize({ text, voice });
    if (result.kind !== "blob") {
      throw new TTSProviderUnavailableError(
        this.primaryProvider.id,
        "provider does not return reusable audio bytes",
      );
    }
    // Same "cache after synth" convention as speak() below.
    void audioCacheStore.set(key, result.blob);
    return result.blob;
  }

  /**
   * Play a piece of text out loud, using the cache when possible.
   * Resolves once playback has finished (or been superseded by a newer call).
   */
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    const { onStateChange, speed = "normal" } = options;
    const voice = resolveVoice(
      options.speaker,
      options.lang ?? DEFAULT_LANG,
      options.rate ?? DEFAULT_RATE,
    );
    // Cache key deliberately ignores `speed` — "slow" replays the exact same
    // pre-generated/cached clip at a reduced HTMLAudioElement.playbackRate
    // rather than needing (and hashing) a second asset per phrase.
    const key = buildCacheKey(text, voice.remoteVoiceId, voice.lang, voice.rate);

    const cachedBlob = await audioCacheStore.get(key);
    if (cachedBlob) {
      await this.playBlob(cachedBlob, onStateChange, speed);
      return;
    }

    this.setState(onStateChange, "loading");
    try {
      const result = await this.synthesizeWithFallback(text, voice, speed, onStateChange);

      if (result.kind === "blob") {
        await this.playBlob(result.blob, onStateChange, speed);
        // Cache after playback has started so the learner never waits on a
        // disk write — this is a pure "for next time" optimization.
        void audioCacheStore.set(key, result.blob);
      } else {
        // Web Speech (or any other "plays itself" provider) already ran to
        // completion by the time synthesize() resolves.
        this.setState(onStateChange, "idle");
      }
    } catch (err) {
      this.setState(onStateChange, "error");
      throw err;
    }
  }

  /** Try the primary provider; on any failure, transparently use the browser voice. */
  private async synthesizeWithFallback(
    text: string,
    voice: VoiceProfile,
    speed: PlaybackSpeed,
    onStateChange?: (state: PronunciationState) => void,
  ): Promise<SynthesizeResult> {
    try {
      return await this.primaryProvider.synthesize({ text, voice, speed });
    } catch (err) {
      if (this.primaryProvider.id !== this.fallbackProvider.id) {
        console.info(
          `[PronunciationService] "${this.primaryProvider.id}" unavailable, using "${this.fallbackProvider.id}" instead`,
          err,
        );
      }
      return this.fallbackProvider.synthesize({
        text,
        voice,
        speed,
        onPlaybackStart: () => this.setState(onStateChange, "playing"),
      });
    }
  }

  /**
   * Stop whatever is currently playing (pre-generated clip or Web Speech
   * utterance), if anything. Safe to call at any time, including when
   * nothing is playing. Used by callers that need to cut a clip short —
   * e.g. HiTCards stopping the English pronunciation the instant a card is
   * flipped back to Malagasy or swapped for the next one.
   */
  stop(): void {
    this.stopCurrentPlayback();
  }

  private playBlob(
    blob: Blob,
    onStateChange?: (state: PronunciationState) => void,
    speed: PlaybackSpeed = "normal",
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stopCurrentPlayback();

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = speed === "slow" ? SLOW_PLAYBACK_RATE : 1;
      // Keep the pitch natural instead of the "chipmunk/deep voice" effect a
      // raw playbackRate change would otherwise cause. Most modern browsers
      // default this to true already; set it explicitly (with vendor
      // prefixes) since a couple of older/mobile engines don't.
      setPreservesPitch(audio, true);
      this.currentAudio = audio;
      this.currentObjectUrl = url;

      audio.oncanplay = () => this.setState(onStateChange, "playing");
      audio.onended = () => {
        this.setState(onStateChange, "idle");
        this.releaseObjectUrl(url);
        resolve();
      };
      audio.onerror = () => {
        this.setState(onStateChange, "error");
        this.releaseObjectUrl(url);
        reject(new Error("Audio playback failed"));
      };

      audio.play().catch((err) => {
        this.setState(onStateChange, "error");
        this.releaseObjectUrl(url);
        reject(err);
      });
    });
  }

  private stopCurrentPlayback(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.currentObjectUrl) {
      this.releaseObjectUrl(this.currentObjectUrl);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  private releaseObjectUrl(url: string): void {
    URL.revokeObjectURL(url);
    if (this.currentObjectUrl === url) this.currentObjectUrl = null;
  }

  private setState(
    onStateChange: ((state: PronunciationState) => void) | undefined,
    state: PronunciationState,
  ): void {
    onStateChange?.(state);
  }

  /** Wipe every cached clip (e.g. exposed from a "clear cache" setting). */
  clearCache(): Promise<void> {
    return audioCacheStore.clear();
  }

  /** Approximate cache footprint, useful for a debug/settings panel. */
  getCacheStats(): Promise<{ count: number; approxBytes: number }> {
    return audioCacheStore.stats();
  }
}

export const pronunciationService = new PronunciationService(
  staticAudioProvider,
  webSpeechProvider,
);
export { PronunciationService };
