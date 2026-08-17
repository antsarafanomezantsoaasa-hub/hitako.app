/**
 * Shared types for the pronunciation / TTS system.
 *
 * Everything here is provider-agnostic on purpose: `PronunciationService`
 * (see PronunciationService.ts) only ever talks to a `TTSProvider`, never to
 * a specific vendor SDK. That's what makes it possible to swap the browser's
 * built-in voice for a paid, higher-quality API later by writing one new
 * class — no UI or caching code has to change.
 */

/** Which of the two playback speeds a clip should use. */
export type PlaybackSpeed = "normal" | "slow";

/** Rate multiplier applied for the "slow" step of the tap cycle. */
export { SLOW_PLAYBACK_RATE } from "../audio-playback-rate";

/** Coarse speaker archetypes used to pick a voice for a line of dialogue. */
export type SpeakerId = "narrator" | "young_man" | "young_woman" | "man" | "woman" | "child";

export type VoiceGender = "male" | "female" | "neutral";

/** A fully-resolved voice, ready to hand to any provider. */
export interface VoiceProfile {
  speaker: SpeakerId;
  gender: VoiceGender;
  /** BCP-47 language tag, e.g. "en-US". */
  lang: string;
  /** Playback rate multiplier (1 = normal speed). */
  rate: number;
  /** Pitch multiplier used by pitch-capable engines (1 = normal). */
  pitch: number;
  /**
   * Vendor-specific voice id for remote/cloud providers (e.g. an OpenAI or
   * ElevenLabs voice name). Ignored by providers that don't need it.
   */
  remoteVoiceId: string;
}

export interface SynthesizeRequest {
  text: string;
  voice: VoiceProfile;
  /** Normal speed, or the slower "catch every sound" pass. Defaults to "normal". */
  speed?: PlaybackSpeed;
  /**
   * Called by providers that play audio themselves instead of returning a
   * `Blob` (namely the browser Web Speech API), the moment sound actually
   * starts coming out of the speakers. Lets the UI switch from a "loading"
   * spinner to a "playing" indicator at the right time.
   */
  onPlaybackStart?: () => void;
}

/** A provider either hands back audio bytes we can cache, or plays the audio itself. */
export type SynthesizeResult = { kind: "blob"; blob: Blob; mimeType: string } | { kind: "played" };

/** Implemented by every TTS backend (browser voice, cloud API, ...). */
export interface TTSProvider {
  /** Short id used only for logging/debugging. */
  readonly id: string;
  synthesize(request: SynthesizeRequest): Promise<SynthesizeResult>;
}

/** Thrown by a provider to signal "I can't handle this right now, try the next one". */
export class TTSProviderUnavailableError extends Error {
  constructor(providerId: string, reason: string) {
    super(`[${providerId}] unavailable: ${reason}`);
    this.name = "TTSProviderUnavailableError";
  }
}

export type PronunciationState = "idle" | "loading" | "playing" | "error";

export interface SpeakOptions {
  speaker?: SpeakerId;
  /** BCP-47 language tag. Defaults to "en-US". */
  lang?: string;
  /** Playback rate multiplier. Defaults to 0.92 (slightly slower, easier to follow). */
  rate?: number;
  /** Normal speed, or the slower "catch every sound" pass. Defaults to "normal". */
  speed?: PlaybackSpeed;
  onStateChange?: (state: PronunciationState) => void;
}
