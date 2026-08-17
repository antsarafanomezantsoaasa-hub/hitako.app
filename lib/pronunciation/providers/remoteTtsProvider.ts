/**
 * Optional cloud TTS provider.
 *
 * This is the "premium, natural voice" slot in the pipeline. It's disabled
 * by default (no vendor is wired up yet) and simply reports itself as
 * unavailable, which makes `PronunciationService` fall back to the browser
 * voice below — the app keeps working with zero configuration.
 *
 * To plug in a real vendor later (OpenAI TTS, ElevenLabs, Azure Speech,
 * Google Cloud TTS, a self-hosted model, ...):
 *   1. Set VITE_TTS_API_URL (and VITE_TTS_API_KEY if the vendor needs auth)
 *      in your .env. The endpoint just needs to accept a POST with
 *      { text, voiceId, lang, rate } and respond with raw audio bytes
 *      (audio/mpeg or audio/wav).
 *   2. If a vendor's request/response shape differs, adjust `synthesize()`
 *      below — nothing outside this file needs to change, since
 *      PronunciationService only depends on the TTSProvider interface.
 *
 * Storage note: this only ever *fetches* audio bytes into memory to play
 * and cache them client-side (IndexedDB, see ../audioCache.ts). It never
 * writes anything to Supabase — there is no Supabase import in this file
 * or anywhere else in the pronunciation module.
 */
import type { SynthesizeRequest, SynthesizeResult, TTSProvider } from "../types";
import { TTSProviderUnavailableError } from "../types";

function getEndpoint(): string | null {
  const url = import.meta.env.VITE_TTS_API_URL as string | undefined;
  return url && url.trim().length > 0 ? url : null;
}

class RemoteTTSProvider implements TTSProvider {
  readonly id = "remote-tts";

  async synthesize({ text, voice }: SynthesizeRequest): Promise<SynthesizeResult> {
    const endpoint = getEndpoint();
    if (!endpoint) {
      throw new TTSProviderUnavailableError(this.id, "VITE_TTS_API_URL is not configured");
    }

    const apiKey = import.meta.env.VITE_TTS_API_KEY as string | undefined;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 10_000) : null;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          text,
          voiceId: voice.remoteVoiceId,
          lang: voice.lang,
          rate: voice.rate,
        }),
        signal: controller?.signal,
      });

      if (!response.ok) {
        throw new TTSProviderUnavailableError(this.id, `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new TTSProviderUnavailableError(this.id, "empty audio response");
      }

      return { kind: "blob", blob, mimeType: blob.type || "audio/mpeg" };
    } catch (err) {
      if (err instanceof TTSProviderUnavailableError) throw err;
      throw new TTSProviderUnavailableError(
        this.id,
        err instanceof Error ? err.message : "request failed",
      );
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

export const remoteTtsProvider = new RemoteTTSProvider();
