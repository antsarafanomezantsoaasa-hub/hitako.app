/**
 * Thin wrapper around getUserMedia + MediaRecorder for capturing a
 * learner's shadowing attempt.
 *
 * Split into "prepare" and "start" on purpose: `prepareMicRecording()` asks
 * for mic permission and gets the recorder ready but does NOT begin
 * capturing. That lets a caller (see ShadowingService.ts) request
 * permission early — e.g. during the countdown — so that when it's
 * actually time to sync with the reference clip, `.start()` is just a
 * synchronous MediaRecorder call with no permission-prompt latency in the
 * critical path.
 */
import type { RecordingResult } from "../types";

/** Thrown when the mic can't be used at all (no getUserMedia support, permission denied, no device, etc). */
export class MicrophoneUnavailableError extends Error {
  constructor(reason: string) {
    super(`Microphone unavailable: ${reason}`);
    this.name = "MicrophoneUnavailableError";
  }
}

export interface PreparedMicRecording {
  /** Begins capturing audio. Call at the precise moment you want t=0 to be. */
  start(): void;
  /** Stops capturing and resolves with the finished clip. Safe to call even if start() was never called. */
  stop(): Promise<RecordingResult>;
  /** Releases the microphone and discards anything captured so far. Safe to call at any point. */
  cancel(): void;
}

/** Picks the first container/codec combo the browser actually supports, or "" to let MediaRecorder pick its own default. */
function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

/**
 * Requests microphone access and arms a MediaRecorder, without starting it.
 * Throws `MicrophoneUnavailableError` if the browser can't support it or
 * the learner denies/never grants permission.
 */
export async function prepareMicRecording(): Promise<PreparedMicRecording> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new MicrophoneUnavailableError("getUserMedia is not supported in this browser");
  }
  if (typeof MediaRecorder === "undefined") {
    throw new MicrophoneUnavailableError("MediaRecorder is not supported in this browser");
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    throw new MicrophoneUnavailableError(err instanceof Error ? err.message : "permission denied");
  }

  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  let startedAt = 0;
  let started = false;

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  };

  const releaseStream = () => {
    for (const track of stream.getTracks()) track.stop();
  };

  const buildResult = (): RecordingResult => ({
    blob: new Blob(chunks, { type: mimeType || "audio/webm" }),
    mimeType: mimeType || "audio/webm",
    durationMs: started ? performance.now() - startedAt : 0,
    startedAt,
  });

  return {
    start() {
      if (started || recorder.state !== "inactive") return;
      started = true;
      startedAt = performance.now();
      recorder.start();
    },

    stop(): Promise<RecordingResult> {
      return new Promise((resolve) => {
        if (recorder.state === "inactive") {
          releaseStream();
          resolve(buildResult());
          return;
        }
        recorder.addEventListener(
          "stop",
          () => {
            releaseStream();
            resolve(buildResult());
          },
          { once: true },
        );
        recorder.stop();
      });
    },

    cancel() {
      if (recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          // Already stopping/stopped — nothing else to do.
        }
      }
      releaseStream();
    },
  };
}
