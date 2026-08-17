/**
 * Last-resort fallback provider built on the browser's native Web Speech API.
 *
 * It ships with zero setup, works fully offline for locally-installed
 * voices, and costs nothing — which is why `PronunciationService` uses it
 * automatically whenever `staticAudioProvider` doesn't have a pre-generated
 * clip for a phrase yet.
 *
 * Trade-off: browsers give no way to capture the synthesized audio as raw
 * bytes, only to play it directly through the speakers. So this provider
 * can't produce a cacheable `Blob` — it plays the clip itself and resolves
 * once playback ends. `PronunciationService` understands this via the
 * `{ kind: "played" }` result and simply skips the caching step for it.
 *
 * Hard timeout: on several mobile combinations (Android in-app WebViews like
 * Instagram/TikTok, devices with no TTS voice pack installed, iOS Safari
 * after the tab has been backgrounded) `speechSynthesis.speak()` silently
 * does nothing — none of `onstart`/`onend`/`onerror` ever fire. Without a
 * timeout the returned Promise would hang forever, and since callers
 * `await` it in a loop (see ListeningActivity's AudioPlayer), the whole UI
 * gets stuck on its loading spinner. `Promise.race` against a fixed timeout
 * guarantees this promise always settles one way or another.
 */
import type { SynthesizeRequest, SynthesizeResult, TTSProvider } from "../types";
import { SLOW_PLAYBACK_RATE, TTSProviderUnavailableError } from "../types";
import { pickWebSpeechVoice } from "../voices";

const SPEECH_TIMEOUT_MS = 6000;

class WebSpeechProvider implements TTSProvider {
  readonly id = "web-speech";

  async synthesize({
    text,
    voice,
    speed = "normal",
    onPlaybackStart,
  }: SynthesizeRequest): Promise<SynthesizeResult> {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      throw new TTSProviderUnavailableError(
        this.id,
        "speechSynthesis not available in this environment",
      );
    }

    const speak = new Promise<SynthesizeResult>((resolve, reject) => {
      // Cancel anything currently speaking so clips never overlap.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice.lang;
      const rateMultiplier = speed === "slow" ? SLOW_PLAYBACK_RATE : 1;
      utterance.rate = clamp(voice.rate * rateMultiplier, 0.5, 2);
      utterance.pitch = clamp(voice.pitch, 0, 2);

      const matchedVoice = pickWebSpeechVoice(voice.lang, voice.gender);
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => onPlaybackStart?.();
      utterance.onend = () => resolve({ kind: "played" });
      utterance.onerror = (event) => {
        // "interrupted"/"canceled" happen when a newer clip preempts this
        // one (see window.speechSynthesis.cancel() above) — not a real error.
        if (event.error === "interrupted" || event.error === "canceled") {
          resolve({ kind: "played" });
          return;
        }
        reject(new Error(`Web Speech synthesis failed: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });

    const timeout = new Promise<SynthesizeResult>((_, reject) =>
      setTimeout(() => {
        // Best-effort cleanup — if the engine ever does wake up late, don't
        // let it start talking after we've already given up on it.
        window.speechSynthesis.cancel();
        reject(
          new TTSProviderUnavailableError(
            this.id,
            "no playback event within timeout — device TTS likely broken",
          ),
        );
      }, SPEECH_TIMEOUT_MS),
    );

    return Promise.race([speak, timeout]);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const webSpeechProvider = new WebSpeechProvider();
