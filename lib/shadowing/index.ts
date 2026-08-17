export { shadowingService, ShadowingService, SessionCancelledError } from "./ShadowingService";
export type {
  ShadowingMode,
  ShadowingPhase,
  ShadowingPhaseDetail,
  ShadowingStateHandler,
  RecordingResult,
  ShadowingSessionConfig,
  ShadowingSessionResult,
  ShadowingSessionHandle,
} from "./types";
export { runCountdown, CountdownCancelledError } from "./utils/countdown";
export type { CountdownOptions } from "./utils/countdown";
export {
  createPlaybackClock,
  waitForPlaybackStart,
  syncPlaybackWithRecording,
} from "./utils/audioSync";
export type { PlaybackClock } from "./utils/audioSync";
export { prepareMicRecording, MicrophoneUnavailableError } from "./utils/recorder";
export type { PreparedMicRecording } from "./utils/recorder";
