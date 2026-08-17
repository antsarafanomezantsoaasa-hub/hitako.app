/**
 * Small helpers shared by everything that plays audio at a variable speed
 * (pronunciation clips, listening activities, shadowing playback).
 *
 * Slow playback is done by lowering `HTMLAudioElement.playbackRate` on the
 * exact same clip rather than shipping a second "slow" asset per phrase.
 */

/** Playback rate multiplier used for the "slow" step of the tap cycle. */
export const SLOW_PLAYBACK_RATE = 0.65;

type PitchPreservingAudio = HTMLAudioElement & {
  preservesPitch?: boolean;
  mozPreservesPitch?: boolean;
  webkitPreservesPitch?: boolean;
};

/**
 * Keep the voice sounding natural when the rate changes instead of the
 * "chipmunk / deep voice" artefact. Most modern browsers already default to
 * true; a couple of older mobile engines still need the vendor prefixes.
 */
export function setPreservesPitch(audio: HTMLAudioElement, value: boolean): void {
  const el = audio as PitchPreservingAudio;
  try {
    if ("preservesPitch" in el) el.preservesPitch = value;
    if ("mozPreservesPitch" in el) el.mozPreservesPitch = value;
    if ("webkitPreservesPitch" in el) el.webkitPreservesPitch = value;
  } catch {
    // Read-only in some engines — harmless, playback still works.
  }
}

/** Apply a normal/slow rate to an audio element, pitch preserved. */
export function applyPlaybackSpeed(audio: HTMLAudioElement, speed: "normal" | "slow"): void {
  audio.playbackRate = speed === "slow" ? SLOW_PLAYBACK_RATE : 1;
  setPreservesPitch(audio, true);
}
