/**
 * Primary provider: serves pre-generated neural-TTS MP3 clips.
 *
 * All learner-facing text (dialogue lines, vocab, pronunciation drills,
 * mission phrases, listening transcripts) is known ahead of time — it's
 * authored lesson copy, not free-form user input. So instead of
 * synthesizing speech live on every learner's device (unreliable — see
 * webSpeechProvider.ts — and stuck with whatever voice happens to be
 * installed on their phone), we generate every clip once with a real
 * neural voice via `scripts/generate-audio.ts` and just play the file back.
 *
 * `audio-manifest.json` maps a cache key (same key format as
 * `audioCache.ts`'s `buildCacheKey`, so lookups line up with the runtime
 * IndexedDB cache) to the clip's public URL under `public/audio/**`.
 *
 * If a phrase isn't in the manifest yet (new/edited copy the generation
 * script hasn't been re-run for), this throws `TTSProviderUnavailableError`
 * — exactly like `remoteTtsProvider` does today — so
 * `PronunciationService` transparently falls back to `webSpeechProvider`.
 *
 * Never touches Supabase: this only ever fetches a static asset already
 * shipped with the app build.
 */
import type { SynthesizeRequest, SynthesizeResult, TTSProvider } from "../types";
import { TTSProviderUnavailableError } from "../types";
import { buildCacheKey } from "../audioCache";
import manifest from "../audio-manifest.json";

// key -> public URL, e.g. "en-US:adult-female-01:0.98:abc123": "/audio/en-US/adult-female-01/abc123.mp3"
const AUDIO_MANIFEST: Record<string, string> = manifest;

class StaticAudioProvider implements TTSProvider {
  readonly id = "static-audio";

  async synthesize({ text, voice }: SynthesizeRequest): Promise<SynthesizeResult> {
    const key = buildCacheKey(text, voice.remoteVoiceId, voice.lang, voice.rate);
    const url = AUDIO_MANIFEST[key];
    if (!url) {
      throw new TTSProviderUnavailableError(this.id, "phrase not pre-generated yet");
    }

    let response: Response;
    try {
      response = await fetch(url);
    } catch (err) {
      throw new TTSProviderUnavailableError(
        this.id,
        err instanceof Error ? err.message : "network request failed",
      );
    }
    if (!response.ok) {
      throw new TTSProviderUnavailableError(this.id, `HTTP ${response.status} fetching ${url}`);
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new TTSProviderUnavailableError(this.id, `empty audio file at ${url}`);
    }

    return { kind: "blob", blob, mimeType: blob.type || "audio/mpeg" };
  }
}

export const staticAudioProvider = new StaticAudioProvider();
